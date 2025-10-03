# Запрос к конфигу

## Обзор

Конфиг реализует серверную логику приложения, включая:
- Авторизацию пользователя в системе уведомлений
- Предоставление актуальной ссылки для WebView
- Управление поведением приложения

## Предварительные требования

Использование конфига не исключает необходимость подключения:
- **AppsFlyer SDK** для трекинга установок
- **Firebase SDK** для уведомлений и аналитики

## Получение эндпоинта

Эндпоинт для запроса к конфигу предоставляется менеджером.

Для получения эндпоинта требуется предоставить:
- **Bundle ID** приложения (например: `com.example.app`)
- **Apple ID** (для iOS приложений)
- **Название приложения** как оно будет указано в целевом сторе

## Формат запроса

Эндпоинт конфига принимает `POST` запрос с заголовком `Content-Type: application/json` и телом запроса, состоящего из данных конверсии, полученных от Appsflyer **и ряда других параметров**. Данные передаются в формате `JSON`

# Параметры

Все параметры тела запроса имеют одинаковую вложенность.

Запрос не имеет обязательных параметров, но отсутствие любого из нижеизложенных параметров негативно повлияет на работоспособность приложения.

## **Данные конверсии**

Данные конверсии доступны после инициализации Appsflyer в колбеке, соответствующем платформе разработки. 

Подробнее о получении данных конверсии написано в документации Appsflyer: 

https://dev.appsflyer.com/hc/docs/conversion-data-android

https://dev.appsflyer.com/hc/docs/conversion-data-ios

https://dev.appsflyer.com/hc/docs/conversion-data-unity

Для запроса к конфигу **используются все параметры, доступные в данных конверсии**, в неизменённом виде. Список параметров, а также сами параметры и их значения не надо как-либо модифицировать.

```json
{
	"adset": "s1s3",
	"af_adset": "mm3",
	"adgroup": "s1s3",
	"campaign_id": "6068535534218",
	"af_status": "Non-organic",
	"agency": "Test",
	"af_sub3": null,
	"af_siteid": null,
	"adset_id": "6073532011618",
	"is_fb": true,
	"is_first_launch": true,
	"click_time": "2017-07-18 12:55:05",
	"iscache": false,
	"ad_id": "6074245540018",
	"af_sub1": "439223",
	"campaign": "Comp_22_GRTRMiOS_111123212_US_iOS_GSLTS_wafb unlim access",
	"is_paid": true,
	"af_sub4": "01",
	"adgroup_id": "6073532011418",
	"is_mobile_data_terms_signed": true,
	"af_channel": "Facebook",
	"af_sub5": null,
	"media_source": "Facebook Ads",
	"install_time": "2017-07-19 08:06:56.189",
	"af_sub2": null
}
```

<aside>
❗ Ни в коем случае не следует изменять полученный список параметров данных конверсии.

</aside>

<aside>
ℹ️ Количество параметров в теле запроса на отдельной установке может значительно отличаться от приведенного примера. Список параметров зависит от источника установки и дополнительных передаваемых данных.

</aside>

## af_id

Параметр `af_id` содержит значение Appsflyer ID, уникального идентификатора установки, который генерируется автоматически при инициализации Appsflyer SDK и доступен как ответ метода getAppsFlyerUID или getAppsFlyerId в зависимости от платформы разработки.

<aside>
⚠️

 В редакторе Unity getAppsFlyerId будет возвращать пустую строку

</aside>

```json
{
	"af_id": "1688042316289-7152592750959506765"
}
```

## bundle_id

Параметр `bundle_id` содержит значение Bundle ID или Package Name приложения. 

<aside>
⚠️

Bundle ID и Store ID для iOS приложений различаются

</aside>

```json
{
	"bundle_id": "com.example.app"
}
```

## os

Параметр os содержит значение платформы приложения. 

Допустимые значения:

- `Android`
- `iOS`

```json
{
	"os": "Android"
}
```

## store_id

Параметр `store_id` содержит значение Store ID приложения. 

Для iOS приложений Store ID указывается с ‘id’ в начале строки.

<aside>
⚠️

Bundle ID и Store ID для iOS приложений различаются

</aside>

```json
{
	"store_id": "com.example.app"
}

{
	"store_id": "id643200239"
}
```

## locale

Параметр `locale` содержит значение основной локализации устройства пользователя.

Значение должно иметь формат в стандарте RFC 3066 – `ru`, `en`, `en_US`, либо значения `English`, `French`, `Spanish`, `Italian` и т. д.

```json
{
	"locale": "En"
}
```

## push_token

Параметр `push_token` содержит значение текущего токена регистрации Firebase Messaging.

<aside>
☝

При обновлении токена необходимо сразу же повторно передать его в новом запросе.

</aside>

Подробнее о настройке Firebase Messaging и получении текущего токена регистрации написано в документации Firebase: https://firebase.google.com/docs/cloud-messaging

```json
{
	"push_token": "dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3"
}
```

## firebase_project_id

Параметр `firebase_project_id` содержит значение Firebase Project number. 

```json
{
	"firebase_project_id": "8934278530"
}
```

## Пример тела запроса

### Исходные данные полученные от AppsFlyer

```json
{
	"adset": "s1s3",
	"af_adset": "mm3",
	"adgroup": "s1s3",
	"campaign_id": "6068535534218",
	"af_status": "Non-organic",
	"agency": "Test",
	"af_sub3": null,
	"af_siteid": null,
	"adset_id": "6073532011618",
	"is_fb": true,
	"is_first_launch": true,
	"click_time": "2017-07-18 12:55:05",
	"iscache": false,
	"ad_id": "6074245540018",
	"af_sub1": "439223",
	"campaign": "Comp_22_GRTRMiOS_111123212_US_iOS_GSLTS_wafb unlim access",
	"is_paid": true,
	"af_sub4": "01",
	"adgroup_id": "6073532011418",
	"is_mobile_data_terms_signed": true,
	"af_channel": "Facebook",
	"af_sub5": null,
	"media_source": "Facebook Ads",
	"install_time": "2017-07-19 08:06:56.189",
	"af_sub2": null,
```

### Данные дополненные на стороне клиента

```json
  "af_id": "1688042316289-7152592750959506765",
	"bundle_id": "com.example.app",
	"os": "Android",
	"store_id": "com.example.app",
	"locale": "En",
	"push_token": "dl28EJCAT4a7UNl86egX-U:APA91bEC1a5aGJL8ZyQHlm-B9togw60MLWP4_zU0ExSXLSa_HiL82Iurj0d-1zJmkMdUcvgCRXTrXtbWQHxmJh49BibLiqZVXPNyrCdZW-_ROTt98f0WCLtt531RYPhWSDOkykcaykE3",
	"firebase_project_id": "8934278530"
}
```

# Ответ конфига

## Пример ответа

Успешный запрос:

<aside>
⚠️

По умолчанию (для тестов) ссылку можно получить только для неорганических установок, т.е. поле `"af_status": "Non-organic"`

</aside>

```json
Status: 200 (OK)
{ 
	"ok": true, 
	"url": "http://link.com/",
	"expires": 1689002181 
}
```

Запрос, завершенный ошибкой:

<aside>
⚠️

Ошибка полученная при запросе к эндпоинту **является отрицательным ответом** для [принятия решения](https://www.notion.so/1afe1469e68a805bb627fc29467dea52?pvs=21) о запуске WebView.

</aside>

```json
404 (Not Found)
{ 
	"ok": false, 
	"message": "No data" 
}
```

|  | Тип | Описание |
| --- | --- | --- |
| ok | Boolean | Статус запроса |
| message | String | Сообщение в случае неуспешного запроса |
| url | String | Актуальная ссылка для приложения |
| expires | Timestamp | Дата окончания срока действия ссылки, после которой следует получить новую ссылку путем выполнения нового запроса |

## Поведение при успешном запросе

В случае успешного выполнения запроса, следует сохранить значения `url` и `expires` и запустить ссылку в вебвью без изменений.

При последующих запусках приложения необходимо сверять значение `expires` с текущим временем девайса. При истечении срока действия ссылки необходимо выполнить повторный запрос, получить и сохранить новые значения.

Если запрос выполнился с ошибкой (код ответа не равен 200), но ранее было получено значение `url`, сохраненное в текущий момент на устройстве, необходимо запустить в вебвью сохраненную ссылку.

## Поведение при неуспешном запросе

В случае неуспешного запроса, если ранее не было получено значение `url`, следует запустить игру и более не делать запросов к конфигу в рамках этой установки, если для этого приложения не была обговорена иная логика работы.