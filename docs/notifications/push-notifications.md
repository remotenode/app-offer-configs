# Настройка и работа с уведомлениями

## Обзор

Уведомления в приложениях реализуются с помощью **Firebase Cloud Messaging (FCM)**.

## Условия запроса разрешений

Если согласно логике приложения запускается **WebView**, необходимо запросить у пользователя разрешение на отправку уведомлений.

Для этого реализуется кастомный экран с предложением получать уведомления:

https://embed.figma.com/design/3IsDE2nS0gSaT0RCpeBQYV/Push?node-id=0-1&p=f&t=2z6enoGrES7Auxyx-0&embed-host=notion&footer=false&theme=system

<aside>
ℹ️ Подготовленный для приложения дизайн может содержать уникальные изображения для данного экрана.

</aside>

**Условия отображения экрана:**

- Показывается **однократно**, если разрешение ещё не получено и **есть возможность его запросить**.
- При отказе — повторный показ через **3 дня (259200 секунд)**.

**Кнопки:**

- **“Yes, I Want Bonuses!”** — запрашивается разрешение на уведомления с последующим переходом к WebView.
- “Skip” — переход к WebView без запроса.

---

Для поддержки уведомлений в Android 13 и выше (API level 33+) необходимо запросить разрешение на отправку уведомлений, для этого надо добавить соответствующее разрешение в манифест и вызвать метод, запрашивающий разрешение.

[Notification runtime permission  |  Views  |  Android Developers](https://developer.android.com/develop/ui/views/notifications/notification-permission)

[ActivityCompat  |  API reference  |  Android Developers](https://developer.android.com/reference/androidx/core/app/ActivityCompat#requestPermissions(android.app.Activity,%20java.lang.String%5B%5D,%20int))

<aside>
⚠️

Запрос разрешения должен происходить до запуска вебвью.

</aside>

---

Для Android необходимо использовать отдельную иконку, которая будет отображаться в уведомлении:

https://embed.figma.com/design/FeBnHuFUJBa2mv0t68d314/Notification-icon?node-id=0-1&p=f&t=BcfG1L34x3pB1FOI-0&embed-host=notion&footer=false&theme=system

![Снимок экрана 2022-12-27 в 14.15.18.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c4659617-3cda-4747-9ad7-3b487b5a8efb/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA_%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0_2022-12-27_%D0%B2_14.15.18.png)

---

Уведомления должны поддерживать картинки

![image.png](attachment:2b2bc017-a3b9-48ce-a655-28d9fc5ffe72:image.png)

![image.png](attachment:fb61a40a-8344-4935-8591-51f77025b850:image.png)

![image.png](attachment:d1c7bf67-196d-44cc-a98f-68f386146cdf:image.png)

![image.png](attachment:3fc69c2f-f168-4df6-87b9-3c43f3f3981d:image.png)

---

## Интеграция с FCM

Для работы уведомлений необходимо подключать сервисный аккаунт 
`marla-export@marfa-290610.iam.gserviceaccount.com` к проекту Firebase через Google Cloud Platform с ролью `Basic → Owner`. Для этого надо:

- перейти в пункт `Users and permissions` в настройках проекта Firebase
- нажать на ссылку `Advanced permission settings` внизу страницы, чтобы перейти в Google Cloud Platform к соответствующему проекту
- нажать кнопку `+ Add` для добавления нового пользователя
- добавить сервисный аккаунт `marla-export@marfa-290610.iam.gserviceaccount.com` и указать уровень доступа `Owner` в категории `Basic`
- Сохранить изменения, нажатием кнопки `Save`

### Поведение при получении уведомлений

1. Настраиваем получение уведомлений в приложении с помощью соответствующих платформе методов.
2. При открытии приложения по клику на уведомление необходимо проверить `data` в `payload` уведомления на наличие ключа `url`.
    - Пример структуры `payload` уведомления
        
        ```json
        {
        	"message":{
        		"token":"bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...",
        		"notification":{
        			"title":"Great offer!",
        			"body":"play now"
        		},
        		"data" : {
        			"url" : "https://example.com/"
        		}
        	}
        }
        ```
        
3. При наличии непустого `url` необходимо запустить в вебвью ссылку указанную в данном параметре.
4. **Эту ссылку не следует сохранять**. При следующем запуске должна запуститься ссылка, полученная из конфига.