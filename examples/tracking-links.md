# Тестовые трекинговые ссылки

## AppsFlyer трекинговая ссылка

Трекинговая ссылка Appsflyer используется для имитации неорганической установки приложения.

### Формат ссылки

```json
https://app.appsflyer.com/com.example.app?pid=Test%20Source&c=testsub_testsub2_testsub_testsub_testsub_testsub_testsub_testsub1%20%23extra&siteid=test&adset=testsub&af_adset=testsub3&af_c_id=testsub4&agency=Test%20Agency&af_sub1=testextra2&af_sub2=testextra3&af_sub3=testextra4&af_sub4=testextra5&af_sub5=testextra6&is_retargeting=true
```

### Onelink ссылка

Альтернативный формат с аналогичным набором параметров:

```json
campaign = testsub_testsub2_testsub_testsub_testsub_testsub_testsub_testsub1 #extra
adset = testsub
af_adset = testsub3
campaign_id = testsub4
media_source = Test Source
af_sub1 = testextra2
af_sub2 = testextra3
af_sub3 = testextra4
af_sub4 = testextra5
af_sub5 = testextra6
agency = Test Agency
is_retargeting = true
```

## Тестирование

Для проверки работы приложения до его публикации:

1. Добавьте GAID/IDFA тестового устройства в список Test Devices в AppsFlyer аккаунте
2. Дополните ссылку параметром `&advertising_id={GAID/IDFA}`
3. Совершите переход по трекинговой ссылке непосредственно перед тестовой установкой

## Важные замечания

- Используйте тестовые ссылки только для разработки и тестирования
- Не используйте тестовые параметры в продакшене
- Убедитесь, что тестовое устройство добавлено в AppsFlyer аккаунт
