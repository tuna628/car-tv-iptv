# CAR TV IPTV

Next.js tabanlı basit IPTV web oynatıcı.

## Vercel
1. Bu klasörü GitHub'a yükle.
2. Vercel'de **New Project** ile repoyu seç.
3. Framework: Next.js olarak algılanır.
4. Build/Install ayarlarını değiştirmeden Deploy'a bas.

## Kanal ekleme
`app/page.js` içindeki `CHANNELS` dizisine sadece kullanma/yayınlama iznin olan M3U8 yayınlarını ekleyebilirsin.

Alternatif olarak site içindeki M3U URL alanına izinli bir M3U listesinin URL'sini girebilirsin.

Not: Tarayıcıdaki CORS kuralları nedeniyle bazı yayın adresleri web oynatıcıda çalışmayabilir.