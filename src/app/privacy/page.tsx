import type { Metadata } from 'next'
import MainLayout from '@/components/layout/MainLayout'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | oneclickdoc',
  description:
    'Политика обработки персональных данных и защиты конфиденциальности пользователей',
}

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Политика конфиденциальности
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">
            Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              1. Общие положения
            </h2>
            <p>
              Настоящая Политика конфиденциальности (далее — «Политика»)
              определяет порядок обработки и защиты персональных данных
              пользователей сервиса <strong>oneclickdoc</strong> (далее —
              «Сервис»).
            </p>
            <p>
              Используя Сервис, вы соглашаетесь с условиями настоящей Политики.
              Если вы не согласны с условиями, пожалуйста, не используйте
              Сервис.
            </p>
            <p>
              Настоящая Политика разработана в соответствии с Федеральным
              законом от 27.07.2006 № 152-ФЗ «О персональных данных».
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              2. Какие данные мы собираем
            </h2>
            <p>При использовании Сервиса мы можем собирать следующие данные:</p>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-800">
              2.1. Данные, предоставляемые вами
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>При регистрации:</strong> имя, адрес электронной почты,
                пароль
              </li>
              <li>
                <strong>При создании документов:</strong> ФИО, паспортные
                данные, адрес проживания, ИНН, контактная информация и другие
                данные, необходимые для заполнения заявлений
              </li>
              <li>
                <strong>При обращении в поддержку:</strong> ваши сообщения и
                контактная информация
              </li>
            </ul>

            <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-800">
              2.2. Данные, собираемые автоматически
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>IP-адрес</li>
              <li>Информация о браузере и устройстве</li>
              <li>Данные о взаимодействии с сайтом (просмотренные страницы, время на сайте)</li>
              <li>Cookie-файлы и аналогичные технологии</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              3. Как мы используем ваши данные
            </h2>
            <p>Мы используем собранные данные для следующих целей:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Предоставление услуг:</strong> создание и сохранение
                документов, генерация PDF-файлов
              </li>
              <li>
                <strong>Улучшение сервиса:</strong> анализ использования,
                выявление ошибок, разработка новых функций
              </li>
              <li>
                <strong>Коммуникация:</strong> отправка уведомлений о статусе
                документов, ответы на запросы в поддержку
              </li>
              <li>
                <strong>Безопасность:</strong> предотвращение мошенничества и
                несанкционированного доступа
              </li>
              <li>
                <strong>Аналитика:</strong> сбор статистики и улучшение
                пользовательского опыта
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              4. Кому мы передаем ваши данные
            </h2>
            <p>
              Мы не продаем и не передаем ваши персональные данные третьим
              лицам, за исключением следующих случаев:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Сервис-провайдеры:</strong> мы можем передавать данные
                компаниям, которые помогают нам в предоставлении услуг
                (хостинг, аналитика, email-рассылки). Эти компании обязаны
                соблюдать конфиденциальность.
              </li>
              <li>
                <strong>Юридические требования:</strong> если это требуется по
                закону или в ответ на запросы государственных органов.
              </li>
              <li>
                <strong>С вашего согласия:</strong> в других случаях только с
                вашего явного согласия.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              5. Как мы защищаем ваши данные
            </h2>
            <p>Мы применяем современные меры безопасности для защиты ваших данных:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Шифрование:</strong> все данные передаются по защищенному протоколу HTTPS
              </li>
              <li>
                <strong>Хеширование паролей:</strong> пароли хранятся в зашифрованном виде (bcrypt)
              </li>
              <li>
                <strong>Ограниченный доступ:</strong> доступ к персональным данным имеют только авторизованные сотрудники
              </li>
              <li>
                <strong>Регулярные обновления:</strong> мы постоянно обновляем системы безопасности
              </li>
            </ul>
            <p className="mt-4">
              Несмотря на наши усилия, ни один метод передачи данных через
              Интернет не является полностью безопасным. Мы не можем
              гарантировать абсолютную безопасность.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              6. Cookie-файлы
            </h2>
            <p>
              Мы используем cookie-файлы для улучшения работы Сервиса. Cookie —
              это небольшие текстовые файлы, которые сохраняются на вашем
              устройстве.
            </p>
            <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-800">
              Какие cookie мы используем:
            </h3>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Необходимые cookie:</strong> для работы аутентификации и базовых функций
              </li>
              <li>
                <strong>Аналитические cookie:</strong> для анализа использования сайта
              </li>
              <li>
                <strong>Функциональные cookie:</strong> для запоминания ваших настроек
              </li>
            </ul>
            <p className="mt-4">
              Вы можете отключить cookie в настройках браузера, но это может
              ограничить функциональность Сервиса.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              7. Ваши права
            </h2>
            <p>В соответствии с законодательством РФ вы имеете право:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Доступ к данным:</strong> запросить информацию о том,
                какие данные мы храним о вас
              </li>
              <li>
                <strong>Исправление данных:</strong> обновить или исправить
                некорректные данные
              </li>
              <li>
                <strong>Удаление данных:</strong> запросить удаление ваших
                персональных данных
              </li>
              <li>
                <strong>Ограничение обработки:</strong> запросить ограничение
                использования ваших данных
              </li>
              <li>
                <strong>Отзыв согласия:</strong> в любой момент отозвать
                согласие на обработку данных
              </li>
            </ul>
            <p className="mt-4">
              Для реализации своих прав обратитесь по адресу:{' '}
              <a
                href="mailto:privacy@oneclickdoc.ru"
                className="text-primary hover:underline"
              >
                privacy@oneclickdoc.ru
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              8. Хранение данных
            </h2>
            <p>
              Мы храним ваши персональные данные столько, сколько необходимо
              для предоставления услуг или выполнения юридических требований:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Данные учетной записи:</strong> до момента удаления
                аккаунта
              </li>
              <li>
                <strong>Документы:</strong> пока вы не удалите их самостоятельно
              </li>
              <li>
                <strong>Логи и аналитика:</strong> до 12 месяцев
              </li>
            </ul>
            <p className="mt-4">
              При удалении учетной записи все ваши персональные данные будут
              удалены в течение 30 дней.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              9. Дети
            </h2>
            <p>
              Сервис не предназначен для лиц младше 18 лет. Мы сознательно не
              собираем персональные данные детей. Если вы узнали, что ваш
              ребенок предоставил нам данные без вашего согласия, свяжитесь с
              нами для их удаления.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              10. Международная передача данных
            </h2>
            <p>
              Ваши данные обрабатываются и хранятся на серверах, расположенных
              в Российской Федерации и странах Европейского Союза. При
              международной передаче данных мы обеспечиваем их защиту в
              соответствии с требованиями законодательства.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              11. Изменения в Политике
            </h2>
            <p>
              Мы оставляем за собой право изменять настоящую Политику в любое
              время. Об изменениях мы уведомим вас через email или уведомление
              на сайте. Рекомендуем периодически проверять эту страницу на
              наличие обновлений.
            </p>
          </section>

          <section className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Контактная информация
            </h2>
            <p>
              Если у вас есть вопросы о настоящей Политике или обработке ваших
              данных, обращайтесь:
            </p>
            <ul className="mt-4 space-y-2">
              <li>
                Email:{' '}
                <a
                  href="mailto:privacy@oneclickdoc.ru"
                  className="text-primary hover:underline"
                >
                  privacy@oneclickdoc.ru
                </a>
              </li>
              <li>
                Общая поддержка:{' '}
                <a
                  href="mailto:support@oneclickdoc.ru"
                  className="text-primary hover:underline"
                >
                  support@oneclickdoc.ru
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
