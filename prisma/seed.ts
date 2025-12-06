import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Очистка существующих данных
  await prisma.document.deleteMany()
  await prisma.formField.deleteMany()
  await prisma.template.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Старые данные удалены')

  // Создание категорий
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'МФЦ и госуслуги',
        slug: 'mfc-gosuslugi',
        icon: 'account_balance',
        description: 'Заявления в МФЦ, получение документов',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Суды',
        slug: 'courts',
        icon: 'gavel',
        description: 'Исковые заявления, жалобы в суд',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Банки',
        slug: 'banks',
        icon: 'account_balance_wallet',
        description: 'Претензии в банк, возврат средств',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'ФНС',
        slug: 'fns',
        icon: 'receipt_long',
        description: 'Налоговые вычеты, регистрация ИП',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Работодатели',
        slug: 'employers',
        icon: 'work',
        description: 'Заявления на отпуск, увольнение',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Другие организации',
        slug: 'other',
        icon: 'business',
        description: 'ЖКХ, образование, здравоохранение',
        order: 6,
      },
    }),
  ])

  console.log('✅ Категории созданы')

  // Создание тестового пользователя
  const hashedPassword = await bcrypt.hash('password123', 10)
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Тестовый пользователь',
      passwordHash: hashedPassword,
    },
  })

  console.log('✅ Тестовый пользователь создан (test@example.com / password123)')

  // Создание шаблона "Заявление на налоговый вычет"
  const taxDeductionTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на налоговый вычет за лечение',
      description:
        'Получите налоговый вычет за медицинские услуги и лекарства',
      categoryId: categories.find((c) => c.slug === 'fns')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В Инспекцию Федеральной налоговой службы<br/>
              по {{district}}<br/>
              от {{fullName}}<br/>
              ИНН {{inn}}<br/>
              Адрес: {{address}}<br/>
              Телефон: {{phone}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin: 20px 0;">о предоставлении социального налогового вычета</h3>

            <p style="text-indent: 40px;">
              Прошу предоставить мне социальный налоговый вычет в соответствии с подпунктом 3 пункта 1 статьи 219
              Налогового кодекса Российской Федерации за {{year}} год в сумме фактически произведенных расходов
              {{amount}} рублей (в пределах установленного лимита 120 000 рублей для обычного лечения),
              уплаченных мной за {{treatmentType}}.
            </p>

            <p style="text-indent: 40px;">
              Медицинские услуги оказаны медицинской организацией, имеющей лицензию на осуществление медицинской деятельности.
            </p>

            <p style="text-indent: 40px;">
              К заявлению прилагаю следующие документы:
            </p>
            <ol>
              <li>Копия паспорта гражданина РФ</li>
              <li>Справка 2-НДФЛ за {{year}} год</li>
              <li>Налоговая декларация по форме 3-НДФЛ за {{year}} год</li>
              <li>Договор с медицинским учреждением на оказание медицинских услуг</li>
              <li>Копия лицензии медицинского учреждения</li>
              <li>Справка об оплате медицинских услуг для представления в налоговые органы (оригинал)</li>
              <li>Платежные документы (чеки, квитанции, платежные поручения)</li>
              <li>Рецепты по форме N 107-1/у (при возмещении расходов на лекарства)</li>
            </ol>

            <p style="text-indent: 40px;">
              <i>Примечание: Максимальная сумма расходов на лечение, по которой предоставляется вычет - 120 000 руб. в год.
              Для дорогостоящего лечения (код услуги "2" в справке) лимит не применяется.</i>
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 100,
      tags: 'налоговый вычет,ФНС,лечение,медицина',
      applicantType: 'physical',
    },
  })

  // Создание полей формы для налогового вычета
  await prisma.formField.createMany({
    data: [
      // Шаг 1: Личные данные
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО (полностью)',
        placeholder: 'Иванов Иван Иванович',
        stepNumber: 1,
        order: 1,
        isRequired: true,
        validationRules: JSON.stringify({ minLength: 5 }),
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'inn',
        fieldType: 'text',
        label: 'ИНН',
        placeholder: '123456789012',
        stepNumber: 1,
        order: 2,
        isRequired: true,
        validationRules: JSON.stringify({ pattern: '^\\d{12}$' }),
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        placeholder: '+7 (900) 123-45-67',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      // Шаг 2: Адрес
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'address',
        fieldType: 'textarea',
        label: 'Адрес регистрации',
        placeholder: 'г. Москва, ул. Ленина, д. 1, кв. 1',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'district',
        fieldType: 'text',
        label: 'Район (для налоговой)',
        placeholder: 'Московскому району г. Москвы',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      // Шаг 3: Информация о вычете
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'year',
        fieldType: 'number',
        label: 'Год, за который запрашивается вычет',
        placeholder: '2024',
        stepNumber: 3,
        order: 1,
        isRequired: true,
        validationRules: JSON.stringify({ min: 2020, max: 2025 }),
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'amount',
        fieldType: 'number',
        label: 'Сумма расходов (рублей)',
        placeholder: '50000',
        stepNumber: 3,
        order: 2,
        isRequired: true,
        validationRules: JSON.stringify({ min: 1, max: 120000 }),
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'treatmentType',
        fieldType: 'select',
        label: 'Вид лечения',
        stepNumber: 3,
        order: 3,
        isRequired: true,
        options: 'медицинские услуги,лекарственные препараты,дорогостоящее лечение',
      },
      {
        templateId: taxDeductionTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи заявления',
        stepNumber: 3,
        order: 4,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Налоговый вычет" создан с полями формы')

  // Создание еще одного популярного шаблона - претензия в банк
  const bankComplaintTemplate = await prisma.template.create({
    data: {
      title: 'Претензия в банк о возврате комиссии',
      description:
        'Требование о возврате незаконно удержанной комиссии или платы за услуги',
      categoryId: categories.find((c) => c.slug === 'banks')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              {{bankName}}<br/>
              от {{fullName}}<br/>
              Адрес: {{address}}<br/>
              Телефон: {{phone}}<br/>
              Email: {{email}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ПРЕТЕНЗИЯ</h2>

            <p style="text-indent: 40px;">
              Я, {{fullName}}, являюсь клиентом {{bankName}} с {{contractDate}},
              номер договора/счета: {{contractNumber}}.
            </p>

            <p style="text-indent: 40px;">
              {{complaintDate}} банком была списана сумма в размере {{amount}} рублей
              за {{serviceType}}. Данное списание считаю незаконным по следующим основаниям:
            </p>

            <p style="text-indent: 40px;">
              {{reason}}
            </p>

            <p style="text-indent: 40px;">
              На основании изложенного и в соответствии со статьями 29, 31 Закона РФ "О защите прав потребителей",
            </p>

            <h3 style="text-align: center;">ПРОШУ:</h3>
            <ol>
              <li>Вернуть незаконно удержанную сумму {{amount}} рублей на счет {{accountNumber}}</li>
              <li>Предоставить письменный ответ на данную претензию в течение 30 дней в соответствии
              с требованиями статьи 16 Федерального закона "О банках и банковской деятельности"
              от 02.12.1990 № 395-1</li>
            </ol>

            <p>
              В случае отказа в удовлетворении претензии буду вынужден(а) обратиться в суд с требованием
              о взыскании указанной суммы, компенсации морального вреда, штрафа в размере 50% от суммы,
              присужденной судом в мою пользу (п. 6 ст. 13 Закона РФ "О защите прав потребителей"),
              а также судебных расходов.
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 95,
      tags: 'банк,претензия,возврат,комиссия',
      applicantType: 'both',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО (полностью)',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'email',
        fieldType: 'text',
        label: 'Email',
        stepNumber: 1,
        order: 3,
        isRequired: true,
        validationRules: JSON.stringify({ pattern: '^[^@]+@[^@]+\\.[^@]+$' }),
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'address',
        fieldType: 'textarea',
        label: 'Адрес',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'bankName',
        fieldType: 'text',
        label: 'Название банка',
        placeholder: 'ПАО "Сбербанк"',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'contractNumber',
        fieldType: 'text',
        label: 'Номер договора/счета',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'contractDate',
        fieldType: 'date',
        label: 'Дата заключения договора',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'accountNumber',
        fieldType: 'text',
        label: 'Номер счета для возврата',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'complaintDate',
        fieldType: 'date',
        label: 'Дата незаконного списания',
        stepNumber: 3,
        order: 1,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'amount',
        fieldType: 'number',
        label: 'Сумма списания (рублей)',
        stepNumber: 3,
        order: 2,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'serviceType',
        fieldType: 'text',
        label: 'За какую услугу списано',
        placeholder: 'SMS-информирование',
        stepNumber: 3,
        order: 3,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'reason',
        fieldType: 'textarea',
        label: 'Обоснование (почему списание незаконно)',
        placeholder:
          'Я не давал согласия на подключение данной услуги. Согласно статье...',
        stepNumber: 3,
        order: 4,
        isRequired: true,
      },
      {
        templateId: bankComplaintTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи претензии',
        stepNumber: 3,
        order: 5,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Претензия в банк" создан')

  // ============= МФЦ И ГОСУСЛУГИ =============

  // Шаблон 3: Заявление на загранпаспорт
  const passportTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на оформление загранпаспорта',
      description: 'Заявление на получение заграничного паспорта гражданина РФ',
      categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В отделение ГУВМ МВД России<br/>
              по {{region}}<br/>
              от {{fullName}}<br/>
              Адрес: {{address}}<br/>
              Телефон: {{phone}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin: 20px 0;">о выдаче заграничного паспорта</h3>

            <p style="text-indent: 40px;">
              Прошу оформить мне заграничный паспорт сроком на {{passportTerm}} лет.
            </p>

            <p style="text-indent: 40px;">
              Паспортные данные:<br/>
              Серия и номер: {{passportSeries}}<br/>
              Дата рождения: {{birthDate}}<br/>
              Место рождения: {{birthPlace}}
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 90,
      tags: 'загранпаспорт,МФЦ,паспорт,документы',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: passportTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО (полностью)',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'region',
        fieldType: 'text',
        label: 'Регион',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес регистрации',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'passportSeries',
        fieldType: 'text',
        label: 'Серия и номер паспорта РФ',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'birthDate',
        fieldType: 'date',
        label: 'Дата рождения',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'birthPlace',
        fieldType: 'text',
        label: 'Место рождения',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'passportTerm',
        fieldType: 'select',
        label: 'Срок действия паспорта',
        stepNumber: 2,
        order: 4,
        isRequired: true,
        options: '5,10',
      },
      {
        templateId: passportTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 5,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Загранпаспорт" создан')

  // Шаблон 4: Регистрация по месту жительства
  const registrationTemplate = await prisma.template.create({
    data: {
      title: 'Заявление о регистрации по месту жительства',
      description: 'Постановка на регистрационный учет по месту жительства (прописка)',
      categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В МВД России<br/>
              от {{fullName}}<br/>
              Паспорт: {{passportSeries}}<br/>
              Телефон: {{phone}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin: 20px 0;">о регистрации по месту жительства</h3>

            <p style="text-indent: 40px;">
              Прошу зарегистрировать меня по адресу: {{newAddress}}.
            </p>

            <p style="text-indent: 40px;">
              Основание: {{ownershipType}} ({{ownerName}}).
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 85,
      tags: 'прописка,регистрация,МФЦ,жилье',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: registrationTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'passportSeries',
        fieldType: 'text',
        label: 'Серия и номер паспорта',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'newAddress',
        fieldType: 'text',
        label: 'Адрес для регистрации',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'ownershipType',
        fieldType: 'select',
        label: 'Тип собственности',
        stepNumber: 2,
        order: 2,
        isRequired: true,
        options: 'собственность,аренда,согласие собственника',
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'ownerName',
        fieldType: 'text',
        label: 'ФИО собственника',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: registrationTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Регистрация по месту жительства" создан')

  // ============= СУДЫ =============

  // Шаблон 5: Исковое заявление о расторжении брака
  const divorceTemplate = await prisma.template.create({
    data: {
      title: 'Исковое заявление о расторжении брака',
      description:
        'Заявление в суд о расторжении брака без согласия супруга или при наличии несовершеннолетних детей',
      categoryId: categories.find((c) => c.slug === 'courts')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В {{courtName}}<br/>
              <br/>
              Истец: {{fullName}}<br/>
              Адрес: {{address}}<br/>
              Телефон: {{phone}}<br/>
              <br/>
              Ответчик: {{spouseName}}<br/>
              Адрес ответчика: {{spouseAddress}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ИСКОВОЕ ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin: 20px 0;">о расторжении брака</h3>

            <p style="text-indent: 40px;">
              {{marriageDate}} я вступил(а) в брак с {{spouseName}}. Брак зарегистрирован {{registrationPlace}}, запись акта о заключении брака {{actNumber}}.
            </p>

            <p style="text-indent: 40px;">
              От брака имеем {{childrenCount}} несовершеннолетних детей: {{childrenInfo}}.
            </p>

            <p style="text-indent: 40px;">
              Совместная жизнь не сложилась, брачные отношения фактически прекращены с {{separationDate}}.
              Дальнейшее сохранение семьи и совместное проживание невозможно. {{divorceReason}}
            </p>

            <p style="text-indent: 40px;">
              Спор о разделе совместно нажитого имущества {{propertyDispute}}.
              Спор о месте жительства детей и порядке общения с ними {{childrenDispute}}.
            </p>

            <p style="text-indent: 40px;">
              На основании изложенного и руководствуясь ст. 21-23 Семейного кодекса Российской Федерации, ст. 131-132 Гражданского процессуального кодекса РФ,
            </p>

            <h3 style="text-align: center; margin: 20px 0;">ПРОШУ:</h3>
            <ol>
              <li>Расторгнуть брак между мной, {{fullName}}, и {{spouseName}}, заключенный {{marriageDate}}, актовая запись {{actNumber}}</li>
            </ol>

            <h3 style="margin-top: 30px;">Цена иска:</h3>
            <p>Не подлежит оценке (пп. 4 п. 1 ст. 333.19 НК РФ), госпошлина 600 рублей.</p>

            <h3>Приложения:</h3>
            <ol>
              <li>Копия искового заявления для ответчика</li>
              <li>Копия свидетельства о заключении брака</li>
              <li>Копии свидетельств о рождении детей (при наличии)</li>
              <li>Квитанция об уплате государственной пошлины (600 рублей)</li>
              <li>Документы, подтверждающие обстоятельства, на которых основаны исковые требования</li>
            </ol>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись истца:</span> _____________ {{fullName}}
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 80,
      tags: 'развод,брак,суд,семья',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: divorceTemplate.id,
        fieldName: 'courtName',
        fieldType: 'text',
        label: 'Название суда',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Ваш адрес',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'spouseName',
        fieldType: 'text',
        label: 'ФИО супруга',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'spouseAddress',
        fieldType: 'text',
        label: 'Адрес супруга',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'marriageDate',
        fieldType: 'date',
        label: 'Дата вступления в брак',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'registrationPlace',
        fieldType: 'text',
        label: 'Место регистрации брака',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'actNumber',
        fieldType: 'text',
        label: 'Номер записи акта',
        stepNumber: 2,
        order: 5,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'childrenCount',
        fieldType: 'select',
        label: 'Количество детей',
        stepNumber: 3,
        order: 1,
        isRequired: true,
        options: 'нет детей,1,2,3,4 и более',
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'childrenInfo',
        fieldType: 'textarea',
        label: 'Информация о детях (ФИО, дата рождения)',
        placeholder: 'Иванов Петр Иванович, 15.05.2015 г.р.',
        stepNumber: 3,
        order: 2,
        isRequired: false,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'childrenDispute',
        fieldType: 'select',
        label: 'Спор о детях',
        stepNumber: 3,
        order: 3,
        isRequired: true,
        options: 'отсутствует,будет рассмотрен отдельно,просим определить место жительства с истцом',
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'separationDate',
        fieldType: 'date',
        label: 'Дата прекращения отношений',
        stepNumber: 3,
        order: 4,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'divorceReason',
        fieldType: 'textarea',
        label: 'Причина развода (подробно)',
        placeholder: 'Например: Постоянные конфликты, разные взгляды на жизнь, отсутствие взаимопонимания...',
        stepNumber: 3,
        order: 5,
        isRequired: true,
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'propertyDispute',
        fieldType: 'select',
        label: 'Спор об имуществе',
        stepNumber: 3,
        order: 6,
        isRequired: true,
        options: 'отсутствует,будет рассмотрен отдельно,имущество отсутствует',
      },
      {
        templateId: divorceTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 3,
        order: 7,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Расторжение брака" создан')

  // ============= ФНС =============

  // Шаблон 6: Вычет за обучение
  const educationDeductionTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на налоговый вычет за обучение',
      description:
        'Социальный налоговый вычет на образование (свое или детей)',
      categoryId: categories.find((c) => c.slug === 'fns')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В Инспекцию Федеральной налоговой службы<br/>
              по {{district}}<br/>
              от {{fullName}}<br/>
              ИНН {{inn}}<br/>
              Адрес: {{address}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin: 20px 0;">о предоставлении налогового вычета</h3>

            <p style="text-indent: 40px;">
              Прошу предоставить мне социальный налоговый вычет в соответствии с п.2 ст. 219
              Налогового кодекса РФ за {{year}} год в сумме {{amount}} рублей,
              уплаченных мной за обучение {{educationType}}.
            </p>

            <p style="text-indent: 40px;">
              Обучение проходило в {{institutionName}}.
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 85,
      tags: 'налоговый вычет,обучение,ФНС,образование',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'inn',
        fieldType: 'text',
        label: 'ИНН',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'district',
        fieldType: 'text',
        label: 'Район/город',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'year',
        fieldType: 'number',
        label: 'Год',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'amount',
        fieldType: 'number',
        label: 'Сумма вычета (руб.)',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'educationType',
        fieldType: 'select',
        label: 'За чье обучение',
        stepNumber: 2,
        order: 3,
        isRequired: true,
        options: 'свое,своего ребенка,своего брата/сестры',
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'institutionName',
        fieldType: 'text',
        label: 'Название учебного заведения',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: educationDeductionTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 5,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Вычет за обучение" создан')

  // ============= РАБОТОДАТЕЛИ =============

  // Шаблон 7: Заявление на отпуск
  const vacationTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на ежегодный оплачиваемый отпуск',
      description: 'Заявление работника на предоставление очередного отпуска',
      categoryId: categories.find((c) => c.slug === 'employers')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px; font-size: 12pt;">
              {{companyName}}<br/>
              {{directorName}}<br/>
              от {{fullName}}<br/>
              Должность: {{position}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>

            <p style="text-indent: 40px;">
              Прошу предоставить мне ежегодный оплачиваемый отпуск продолжительностью {{days}} календарных дней
              с {{startDate}} по {{endDate}}.
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 100,
      tags: 'отпуск,работа,работодатель,отдых',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: vacationTemplate.id,
        fieldName: 'companyName',
        fieldType: 'text',
        label: 'Название организации',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'directorName',
        fieldType: 'text',
        label: 'ФИО директора',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'position',
        fieldType: 'text',
        label: 'Должность',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'startDate',
        fieldType: 'date',
        label: 'Дата начала отпуска',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'endDate',
        fieldType: 'date',
        label: 'Дата окончания отпуска',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'days',
        fieldType: 'number',
        label: 'Количество дней',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: vacationTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Заявление на отпуск" создан')

  // Шаблон 8: Заявление об увольнении
  const resignationTemplate = await prisma.template.create({
    data: {
      title: 'Заявление об увольнении по собственному желанию',
      description:
        'Заявление работника об увольнении по инициативе работника (ст. 80 ТК РФ)',
      categoryId: categories.find((c) => c.slug === 'employers')!.id,
      contentJson: JSON.stringify({
        html: `
          <div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              {{companyName}}<br/>
              {{directorName}}<br/>
              от {{fullName}}<br/>
              Должность: {{position}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>

            <p style="text-indent: 40px;">
              Прошу уволить меня по собственному желанию с {{dismissalDate}} на основании статьи 80 Трудового кодекса РФ.
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>
        `,
      }),
      isActive: true,
      popularityScore: 90,
      tags: 'увольнение,работа,работодатель,трудовой кодекс',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: resignationTemplate.id,
        fieldName: 'companyName',
        fieldType: 'text',
        label: 'Название организации',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: resignationTemplate.id,
        fieldName: 'directorName',
        fieldType: 'text',
        label: 'ФИО директора',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: resignationTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: resignationTemplate.id,
        fieldName: 'position',
        fieldType: 'text',
        label: 'Должность',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: resignationTemplate.id,
        fieldName: 'dismissalDate',
        fieldType: 'date',
        label: 'Дата увольнения',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: resignationTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Шаблон "Увольнение" создан')

  // ============= БАНКИ =============

  // Шаблон 9: Закрытие счета/карты
  const closeAccountTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на закрытие банковского счета/карты',
      description: 'Закрытие расчетного счета или банковской карты',
      categoryId: categories.find((c) => c.slug === 'banks')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{bankName}}<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <p style="text-indent: 40px;">Прошу закрыть мой счет/карту №{{accountNumber}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 70,
      tags: 'банк,счет,карта,закрытие',
      applicantType: 'both',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: closeAccountTemplate.id,
        fieldName: 'bankName',
        fieldType: 'text',
        label: 'Название банка',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: closeAccountTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: closeAccountTemplate.id,
        fieldName: 'accountNumber',
        fieldType: 'text',
        label: 'Номер счета/карты',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: closeAccountTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
    ],
  })

  // Шаблон 10: Реструктуризация кредита
  const loanRestructureTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на реструктуризацию кредита',
      description:
        'Изменение условий кредитного договора при финансовых сложностях',
      categoryId: categories.find((c) => c.slug === 'banks')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{bankName}}<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center;">о реструктуризации кредита</h3>
            <p style="text-indent: 40px;">Прошу пересмотреть условия кредитного договора №{{loanNumber}} в связи с {{reason}}. Предлагаю {{proposedTerms}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 75,
      tags: 'банк,кредит,реструктуризация,долг',
      applicantType: 'both',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'bankName',
        fieldType: 'text',
        label: 'Название банка',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'loanNumber',
        fieldType: 'text',
        label: 'Номер договора',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'reason',
        fieldType: 'textarea',
        label: 'Причина обращения',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'proposedTerms',
        fieldType: 'textarea',
        label: 'Предлагаемые условия',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: loanRestructureTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // ============= ФНС (дополнительные) =============

  // Шаблон 11: Получение ИНН
  const innApplicationTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на получение ИНН',
      description:
        'Заявление о постановке на учет физического лица и получении ИНН',
      categoryId: categories.find((c) => c.slug === 'fns')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">В Инспекцию ФНС<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center;">о постановке на учет физического лица</h3>
            <p>ФИО: {{fullName}}<br/>Дата рождения: {{birthDate}}<br/>Паспорт: {{passportSeries}}<br/>Адрес: {{address}}</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 88,
      tags: 'ИНН,ФНС,налоги,регистрация',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: innApplicationTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: innApplicationTemplate.id,
        fieldName: 'birthDate',
        fieldType: 'date',
        label: 'Дата рождения',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: innApplicationTemplate.id,
        fieldName: 'passportSeries',
        fieldType: 'text',
        label: 'Серия и номер паспорта',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: innApplicationTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес регистрации',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: innApplicationTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 1,
        order: 5,
        isRequired: true,
      },
    ],
  })

  // Шаблон 12: Вычет за покупку квартиры
  const propertyDeductionTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на налоговый вычет при покупке жилья',
      description: 'Имущественный налоговый вычет при покупке квартиры/дома',
      categoryId: categories.find((c) => c.slug === 'fns')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В Инспекцию ФНС России<br/>
              {{taxOffice}}<br/>
              от {{fullName}}<br/>
              ИНН {{inn}}<br/>
              Адрес регистрации: {{address}}<br/>
              Телефон: {{phone}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin-bottom: 20px;">о предоставлении имущественного налогового вычета</h3>

            <p style="text-indent: 40px;">
              Прошу предоставить мне имущественный налоговый вычет в соответствии с подпунктом 3 пункта 1
              статьи 220 Налогового кодекса Российской Федерации за {{year}} год в сумме фактически
              произведенных расходов {{amount}} рублей (в пределах установленного лимита 2 000 000 рублей)
              в связи с приобретением {{propertyType}} по адресу: {{propertyAddress}}.
            </p>

            <p style="text-indent: 40px;">
              Право собственности на объект недвижимости зарегистрировано {{registrationDate}},
              номер регистрации: {{registrationNumber}}.
            </p>

            <h3 style="margin-top: 30px;">Приложения:</h3>
            <ol>
              <li>Копия паспорта гражданина РФ</li>
              <li>Справка 2-НДФЛ за {{year}} год</li>
              <li>Налоговая декларация по форме 3-НДФЛ за {{year}} год</li>
              <li>Копия договора купли-продажи (или договора долевого участия)</li>
              <li>Копия свидетельства о государственной регистрации права собственности (или выписка из ЕГРН)</li>
              <li>Платежные документы, подтверждающие факт уплаты денежных средств (квитанции, платежные поручения, расписки)</li>
              <li>Копия акта приема-передачи (для договора долевого участия)</li>
            </ol>

            <p style="margin-top: 20px; text-indent: 40px;">
              <i>Примечание: Максимальная сумма расходов на приобретение жилья, с которой предоставляется
              вычет - 2 000 000 рублей (максимальная сумма возврата налога - 260 000 рублей). Дополнительно
              можно получить вычет по процентам по ипотеке в размере до 3 000 000 рублей
              (максимальный возврат - 390 000 рублей).</i>
            </p>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись:</span> _____________
              </p>
            </div>
          </div>`,
      }),
      isActive: true,
      popularityScore: 95,
      tags: 'налоговый вычет,квартира,жилье,ФНС,недвижимость',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО (полностью)',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'inn',
        fieldType: 'text',
        label: 'ИНН',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'taxOffice',
        fieldType: 'text',
        label: 'Номер налоговой инспекции (например, № 28 по г. Москве)',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес регистрации',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 1,
        order: 5,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'year',
        fieldType: 'number',
        label: 'Год, за который запрашивается вычет',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'amount',
        fieldType: 'number',
        label: 'Сумма фактических расходов (не более 2 000 000 руб.)',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'propertyType',
        fieldType: 'select',
        label: 'Тип недвижимости',
        stepNumber: 2,
        order: 3,
        isRequired: true,
        options: 'квартиры,дома,комнаты,земельного участка',
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'propertyAddress',
        fieldType: 'text',
        label: 'Адрес приобретенной недвижимости',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'registrationDate',
        fieldType: 'date',
        label: 'Дата регистрации права собственности',
        stepNumber: 3,
        order: 1,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'registrationNumber',
        fieldType: 'text',
        label: 'Номер регистрации права собственности',
        stepNumber: 3,
        order: 2,
        isRequired: true,
      },
      {
        templateId: propertyDeductionTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи заявления',
        stepNumber: 3,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // ============= РАБОТОДАТЕЛИ (дополнительные) =============

  // Шаблон 13: Декретный отпуск
  const maternityLeaveTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на отпуск по беременности и родам',
      description: 'Декретный отпуск и пособие по беременности и родам',
      categoryId: categories.find((c) => c.slug === 'employers')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{companyName}}<br/>{{directorName}}<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <p style="text-indent: 40px;">Прошу предоставить мне отпуск по беременности и родам на основании листка нетрудоспособности с {{startDate}} по {{endDate}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 80,
      tags: 'декрет,беременность,отпуск,работа',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'companyName',
        fieldType: 'text',
        label: 'Название организации',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'directorName',
        fieldType: 'text',
        label: 'ФИО директора',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'startDate',
        fieldType: 'date',
        label: 'Дата начала',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'endDate',
        fieldType: 'date',
        label: 'Дата окончания',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: maternityLeaveTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // Шаблон 14: Отпуск без сохранения зарплаты
  const unpaidLeaveTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на отпуск без сохранения заработной платы',
      description: 'Отпуск за свой счет (без содержания)',
      categoryId: categories.find((c) => c.slug === 'employers')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{companyName}}<br/>{{directorName}}<br/>от {{fullName}}<br/>Должность: {{position}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <p style="text-indent: 40px;">Прошу предоставить мне отпуск без сохранения заработной платы с {{startDate}} по {{endDate}} продолжительностью {{days}} дней по причине: {{reason}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 70,
      tags: 'отпуск,работа,работодатель,без содержания',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'companyName',
        fieldType: 'text',
        label: 'Название организации',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'directorName',
        fieldType: 'text',
        label: 'ФИО директора',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'position',
        fieldType: 'text',
        label: 'Должность',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'startDate',
        fieldType: 'date',
        label: 'Дата начала',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'endDate',
        fieldType: 'date',
        label: 'Дата окончания',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'days',
        fieldType: 'number',
        label: 'Количество дней',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'reason',
        fieldType: 'textarea',
        label: 'Причина',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: unpaidLeaveTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 5,
        isRequired: true,
      },
    ],
  })

  // ============= МФЦ (дополнительные) =============

  // Шаблон 15: Справка о несудимости
  const criminalRecordTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на получение справки о несудимости',
      description:
        'Заявление на получение справки об отсутствии судимости (форма 2)',
      categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">В ГУ МВД России<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center;">о выдаче справки об отсутствии судимости</h3>
            <p>ФИО: {{fullName}}<br/>Дата рождения: {{birthDate}}<br/>Место рождения: {{birthPlace}}<br/>Паспорт: {{passportSeries}}<br/>Адрес: {{address}}<br/>Цель получения: {{purpose}}</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 78,
      tags: 'справка,несудимость,МВД,МФЦ',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'birthDate',
        fieldType: 'date',
        label: 'Дата рождения',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'birthPlace',
        fieldType: 'text',
        label: 'Место рождения',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'passportSeries',
        fieldType: 'text',
        label: 'Серия и номер паспорта',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес регистрации',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'purpose',
        fieldType: 'select',
        label: 'Цель получения',
        stepNumber: 2,
        order: 2,
        isRequired: true,
        options: 'для трудоустройства,для получения визы,для усыновления,иное',
      },
      {
        templateId: criminalRecordTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // Шаблон 16: Получение СНИЛС
  const snilsTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на получение СНИЛС',
      description:
        'Страховой номер индивидуального лицевого счета (СНИЛС)',
      categoryId: categories.find((c) => c.slug === 'mfc-gosuslugi')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">В Пенсионный фонд России<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center;">о регистрации в системе индивидуального учета</h3>
            <p>ФИО: {{fullName}}<br/>Дата рождения: {{birthDate}}<br/>Место рождения: {{birthPlace}}<br/>Паспорт: {{passportSeries}}<br/>Адрес: {{address}}<br/>Телефон: {{phone}}</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 82,
      tags: 'СНИЛС,ПФР,пенсия,МФЦ',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: snilsTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'ФИО',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'birthDate',
        fieldType: 'date',
        label: 'Дата рождения',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'birthPlace',
        fieldType: 'text',
        label: 'Место рождения',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'passportSeries',
        fieldType: 'text',
        label: 'Серия и номер паспорта',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес регистрации',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'phone',
        fieldType: 'text',
        label: 'Телефон',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: snilsTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // ============= ДРУГИЕ ОРГАНИЗАЦИИ =============

  // Шаблон 17: Претензия в ЖКХ
  const housingComplaintTemplate = await prisma.template.create({
    data: {
      title: 'Претензия в управляющую компанию (ЖКХ)',
      description:
        'Жалоба на некачественные услуги ЖКХ или нарушение договора',
      categoryId: categories.find((c) => c.slug === 'other')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{companyName}}<br/>от {{fullName}}<br/>Адрес: {{address}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ПРЕТЕНЗИЯ</h2>
            <p style="text-indent: 40px;">Я являюсь собственником квартиры по адресу: {{address}}. {{complaintText}}</p>
            <h3 style="text-align: center;">ПРОШУ:</h3>
            <p>{{demands}}</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 72,
      tags: 'ЖКХ,претензия,коммунальные услуги,УК',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'companyName',
        fieldType: 'text',
        label: 'Название УК',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'address',
        fieldType: 'text',
        label: 'Адрес квартиры',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'complaintText',
        fieldType: 'textarea',
        label: 'Суть претензии',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'demands',
        fieldType: 'textarea',
        label: 'Ваши требования',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: housingComplaintTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // Шаблон 18: Возврат товара в магазин
  const returnGoodsTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на возврат товара надлежащего качества',
      description: 'Возврат товара в течение 14 дней (ст. 25 ЗоЗПП)',
      categoryId: categories.find((c) => c.slug === 'other')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">{{storeName}}<br/>от {{fullName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center;">о возврате товара</h3>
            <p style="text-indent: 40px;">{{purchaseDate}} приобрел(а) товар: {{productName}} стоимостью {{price}} рублей. Прошу вернуть мне уплаченную сумму в связи с {{reason}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 76,
      tags: 'возврат,товар,магазин,защита прав потребителей',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'storeName',
        fieldType: 'text',
        label: 'Название магазина',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'purchaseDate',
        fieldType: 'date',
        label: 'Дата покупки',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'productName',
        fieldType: 'text',
        label: 'Название товара',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'price',
        fieldType: 'number',
        label: 'Стоимость (руб.)',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'reason',
        fieldType: 'select',
        label: 'Причина возврата',
        stepNumber: 2,
        order: 3,
        isRequired: true,
        options:
          'не подошел размер,не подошел цвет,не подошла форма,иная причина',
      },
      {
        templateId: returnGoodsTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
    ],
  })

  // Шаблон 19: Перевод ребенка в другую школу
  const schoolTransferTemplate = await prisma.template.create({
    data: {
      title: 'Заявление на перевод ребенка в другую школу',
      description: 'Заявление об отчислении в порядке перевода',
      categoryId: categories.find((c) => c.slug === 'other')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt;">
            <div style="text-align: right; margin-bottom: 20px;">Директору {{schoolName}}<br/>от {{parentName}}</div>
            <h2 style="text-align: center; margin: 30px 0;">ЗАЯВЛЕНИЕ</h2>
            <p style="text-indent: 40px;">Прошу отчислить моего ребенка {{childName}}, ученика(цу) {{grade}} класса, в порядке перевода в {{newSchoolName}} с {{transferDate}}.</p>
            <p>Дата: {{date}}<br/>Подпись: _____________</p>
          </div>`,
      }),
      isActive: true,
      popularityScore: 68,
      tags: 'школа,образование,перевод,дети',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'schoolName',
        fieldType: 'text',
        label: 'Название текущей школы',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'parentName',
        fieldType: 'text',
        label: 'ФИО родителя',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'childName',
        fieldType: 'text',
        label: 'ФИО ребенка',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'grade',
        fieldType: 'number',
        label: 'Класс',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'newSchoolName',
        fieldType: 'text',
        label: 'Название новой школы',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'transferDate',
        fieldType: 'date',
        label: 'Дата перевода',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: schoolTransferTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
    ],
  })

  // Шаблон 20: Исковое о защите прав потребителей
  const consumerRightsTemplate = await prisma.template.create({
    data: {
      title: 'Исковое заявление о защите прав потребителей',
      description:
        'Иск к продавцу/исполнителю услуг о возмещении ущерба',
      categoryId: categories.find((c) => c.slug === 'courts')!.id,
      contentJson: JSON.stringify({
        html: `<div style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5;">
            <div style="text-align: right; margin-bottom: 20px;">
              В {{courtName}}<br/><br/>
              <strong>Истец:</strong> {{fullName}}<br/>
              Адрес: {{plaintiffAddress}}<br/>
              Телефон: {{plaintiffPhone}}<br/><br/>
              <strong>Ответчик:</strong> {{defendant}}<br/>
              Адрес: {{defendantAddress}}
            </div>

            <h2 style="text-align: center; margin: 30px 0;">ИСКОВОЕ ЗАЯВЛЕНИЕ</h2>
            <h3 style="text-align: center; margin-bottom: 20px;">о защите прав потребителей</h3>

            <h3 style="margin-top: 20px;">Обстоятельства дела:</h3>
            <p style="text-indent: 40px;">
              {{purchaseDate}} я приобрел(а) у ответчика {{productService}} стоимостью {{price}} рублей.
              Договор/чек/квитанция № {{documentNumber}} от {{purchaseDate}}.
            </p>

            <p style="text-indent: 40px;">
              {{violation}}
            </p>

            <p style="text-indent: 40px;">
              {{pretensionDate}} мною была направлена претензия ответчику с требованием {{pretensionDemand}}.
              {{pretensionResult}}
            </p>

            <h3 style="margin-top: 30px;">Правовое обоснование:</h3>
            <p style="text-indent: 40px;">
              В соответствии со статьями 18, 23, 28 Закона РФ "О защите прав потребителей" потребитель
              вправе требовать возмещения убытков, причиненных ему вследствие продажи товара ненадлежащего
              качества либо предоставления услуги ненадлежащего качества.
            </p>

            <p style="text-indent: 40px;">
              Согласно пункту 6 статьи 13 Закона РФ "О защите прав потребителей", при удовлетворении
              судом требований потребителя, установленных законом, суд взыскивает с изготовителя (исполнителя,
              продавца, уполномоченной организации или уполномоченного индивидуального предпринимателя,
              импортера) за несоблюдение в добровольном порядке удовлетворения требований потребителя
              штраф в размере пятьдесят процентов от суммы, присужденной судом в пользу потребителя.
            </p>

            <p style="text-indent: 40px;">
              В силу статьи 15 Закона РФ "О защите прав потребителей" моральный вред, причиненный
              потребителю вследствие нарушения изготовителем (исполнителем, продавцом) прав потребителя,
              подлежит компенсации причинителем вреда при наличии его вины.
            </p>

            <h3 style="text-align: center; margin-top: 30px;">ПРОШУ СУД:</h3>
            <ol>
              <li>Взыскать с ответчика в мою пользу стоимость товара/услуги в размере {{price}} рублей</li>
              <li>Взыскать компенсацию морального вреда в размере {{moralDamage}} рублей</li>
              <li>Взыскать штраф в размере 50% от суммы, присужденной судом в мою пользу
              (п. 6 ст. 13 Закона РФ "О защите прав потребителей")</li>
              <li>Взыскать судебные расходы</li>
            </ol>

            <h3 style="margin-top: 30px;">Цена иска:</h3>
            <p>{{price}} (стоимость товара/услуги) + {{moralDamage}} (моральный вред) = {{totalClaim}} рублей.</p>

            <p style="text-indent: 40px;">
              <i>Примечание: В соответствии с п. 3 ст. 17 Закона РФ "О защите прав потребителей" потребители
              освобождаются от уплаты государственной пошлины по искам, связанным с нарушением их прав.</i>
            </p>

            <h3 style="margin-top: 30px;">Приложения:</h3>
            <ol>
              <li>Копия искового заявления для ответчика</li>
              <li>Копия договора/чека/квитанции об оплате</li>
              <li>Копия претензии с отметкой о вручении (или с описью вложения)</li>
              <li>Документы, подтверждающие обстоятельства дела (акты, заключения экспертизы, фотографии и т.д.)</li>
              <li>Расчет цены иска</li>
            </ol>

            <div style="margin-top: 40px;">
              <p>
                <span style="display: inline-block; width: 150px;">Дата:</span> {{date}}<br/>
                <span style="display: inline-block; width: 150px;">Подпись истца:</span> _____________
              </p>
            </div>
          </div>`,
      }),
      isActive: true,
      popularityScore: 74,
      tags: 'суд,защита прав потребителей,иск,компенсация',
      applicantType: 'physical',
    },
  })

  await prisma.formField.createMany({
    data: [
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'courtName',
        fieldType: 'text',
        label: 'Название суда (например, Тверской районный суд г. Москвы)',
        stepNumber: 1,
        order: 1,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'fullName',
        fieldType: 'text',
        label: 'Ваше ФИО (полностью)',
        stepNumber: 1,
        order: 2,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'plaintiffAddress',
        fieldType: 'text',
        label: 'Ваш адрес',
        stepNumber: 1,
        order: 3,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'plaintiffPhone',
        fieldType: 'text',
        label: 'Ваш телефон',
        stepNumber: 1,
        order: 4,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'defendant',
        fieldType: 'text',
        label: 'Ответчик (полное наименование организации)',
        stepNumber: 1,
        order: 5,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'defendantAddress',
        fieldType: 'text',
        label: 'Адрес ответчика',
        stepNumber: 1,
        order: 6,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'purchaseDate',
        fieldType: 'date',
        label: 'Дата покупки товара/заказа услуги',
        stepNumber: 2,
        order: 1,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'productService',
        fieldType: 'text',
        label: 'Наименование товара/услуги',
        stepNumber: 2,
        order: 2,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'price',
        fieldType: 'number',
        label: 'Стоимость товара/услуги (руб.)',
        stepNumber: 2,
        order: 3,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'documentNumber',
        fieldType: 'text',
        label: 'Номер договора/чека/квитанции',
        stepNumber: 2,
        order: 4,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'violation',
        fieldType: 'textarea',
        label: 'Подробное описание нарушения прав (какой недостаток обнаружен, в чем именно выражается нарушение)',
        stepNumber: 2,
        order: 5,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'pretensionDate',
        fieldType: 'date',
        label: 'Дата направления претензии ответчику',
        stepNumber: 3,
        order: 1,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'pretensionDemand',
        fieldType: 'text',
        label: 'Требование в претензии (например: возврата денежных средств, замены товара)',
        stepNumber: 3,
        order: 2,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'pretensionResult',
        fieldType: 'textarea',
        label: 'Результат рассмотрения претензии (например: Претензия оставлена без ответа / Получен отказ)',
        stepNumber: 3,
        order: 3,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'moralDamage',
        fieldType: 'number',
        label: 'Размер компенсации морального вреда (руб.)',
        stepNumber: 3,
        order: 4,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'totalClaim',
        fieldType: 'number',
        label: 'Общая цена иска (автоматически: стоимость + моральный вред)',
        stepNumber: 3,
        order: 5,
        isRequired: true,
      },
      {
        templateId: consumerRightsTemplate.id,
        fieldName: 'date',
        fieldType: 'date',
        label: 'Дата подачи искового заявления',
        stepNumber: 3,
        order: 6,
        isRequired: true,
      },
    ],
  })

  console.log('✅ Все дополнительные шаблоны созданы')

  console.log('🎉 База данных успешно заполнена!')
  console.log('📊 Создано:')
  console.log(`   - ${categories.length} категорий`)
  console.log(`   - 20 шаблонов`)
  console.log(`   - 1 тестовый пользователь`)
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
