# Humanity Protocol Daily Claim Bot

1. Clone & Install
```bash
git clone https://github.com/isansut/humanity-protocol.git
cd humanity-protocol
npm install
```

2. Edit Token & Proxy
- Edit `token.txt` dengan token Anda
- Edit `proxy.txt` dengan proxy Anda

3. Jalankan Bot
```bash
screen -S humanity
node main.js
```
Tekan `Ctrl + A` lalu `D` untuk keluar dari screen

4. Perintah Screen
```bash
screen -ls          # Lihat daftar screen
screen -r humanity  # Masuk ke screen bot
Ctrl + C            # Hentikan bot
Ctrl + A + D        # Keluar dari screen
```

## Fitur
- Multi Akun: Dukung banyak akun dalam satu file token.txt
- Proxy Support: Gunakan proxy berbeda untuk setiap akun
- Cek IP Otomatis: Verifikasi IP yang digunakan saat request
- User Info: Tampilkan address dan nickname
- Delay Antara Akun: 5 detik delay untuk menghindari rate limit
- Auto Claim: Berjalan setiap 24 jam secara otomatis
- Status Warna: Output berwarna untuk memudahkan monitoring
- Error Handling: Penanganan error yang lebih baik

## Kontak
- Telegram: @isanbayo
- Github: https://github.com/isansut 