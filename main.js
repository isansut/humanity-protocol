import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs';
import tunnel from 'tunnel';

// Tampilkan header
console.log(chalk.yellow('\n=== HUMANITY PROTOCOL DAILY CLAIM BOT ==='));
console.log(chalk.cyan('Telegram: @isanbayo'));
console.log(chalk.cyan('Github: https://github.com/isansut'));
console.log(chalk.yellow('==========================================\n'));

// Baca token dari file
function bacaToken() {
    try {
        const data = fs.readFileSync('token.txt', 'utf8');
        return data.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#')); // Abaikan baris kosong dan komentar
    } catch (error) {
        console.error(chalk.red('Error membaca file token.txt:'), error.message);
        return [];
    }
}

// Baca proxy dari file
function bacaProxy() {
    try {
        const data = fs.readFileSync('proxy.txt', 'utf8');
        return data.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#')); // Abaikan baris kosong dan komentar
    } catch (error) {
        console.error(chalk.red('Error membaca file proxy.txt:'), error.message);
        return [];
    }
}

// Fungsi untuk mendapatkan proxy acak
function dapatkanProxyAcak(proxyList) {
    if (proxyList.length === 0) return null;
    return proxyList[Math.floor(Math.random() * proxyList.length)];
}

// Fungsi untuk membuat instance axios dengan proxy
function buatAxiosInstance(token, proxyUrl) {
    const config = {
        baseURL: 'https://testnet.humanity.org',
        headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.7',
            'authorization': `Bearer ${token}`,
            'content-type': 'application/json',
            'origin': 'https://testnet.humanity.org',
            'referer': 'https://testnet.humanity.org/dashboard',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
            'token': token,
            'cookie': 'selectWallet=MetaMask; hp_has_seen_tour=true; hp_has_seen_hp_notification=true'
        }
    };

    if (proxyUrl) {
        try {
            const proxyUrlObj = new URL(proxyUrl);
            const proxyConfig = {
                proxy: {
                    host: proxyUrlObj.hostname,
                    port: proxyUrlObj.port,
                    proxyAuth: proxyUrlObj.username + ':' + proxyUrlObj.password
                }
            };
            config.httpsAgent = tunnel.httpsOverHttp(proxyConfig);
            config.proxy = false;
        } catch (error) {
            console.error(chalk.red('Error setting up proxy:'), error.message);
        }
    }

    return axios.create(config);
}

// Fungsi untuk mengecek IP
async function cekIP(api) {
    try {
        const response = await api.get('https://api.ipify.org?format=json');
        console.log(chalk.cyan(`IP Aktual: ${response.data.ip}`));
        return response.data.ip;
    } catch (error) {
        console.error(chalk.red('Error saat mengecek IP:'), error.message);
        return null;
    }
}

// Fungsi untuk mendapatkan info user
async function getUserInfo(api, nomorAkun) {
    try {
        const response = await api.post('/api/user/userInfo', {});
        console.log(chalk.cyan(`\n=== INFO USER AKUN ${nomorAkun} ===`));
        
        if (response.data && response.data.data) {
            const userData = response.data.data;
            console.log(chalk.cyan('Address:'), userData.ethAddress || 'Tidak tersedia');
            console.log(chalk.cyan('Nickname:'), userData.nickName || 'Tidak tersedia');
        } else {
            console.log(chalk.yellow('Data user tidak tersedia'));
        }
        
        return response.data;
    } catch (error) {
        console.error(chalk.red(`\nError saat mendapatkan info user akun ${nomorAkun}:`), error.message);
        if (error.response) {
            console.error(chalk.red('Data Respon:'), error.response.data);
        }
    }
}

// Fungsi untuk memformat saldo
function formatSaldo(data) {
    if (!data || !data.balance) return 'Data tidak tersedia';
    return `Total Hadiah: ${chalk.green(data.balance.total_rewards)} HP\nHadiah Referral Hari Ini: ${chalk.yellow(data.balance.referral_rewards_today)} HP`;
}

// Fungsi untuk memformat respon klaim
function formatResponKlaim(data) {
    if (!data) return 'Data tidak tersedia';
    return `Status: ${data.daily_claimed ? chalk.red('Sudah Diklaim') : chalk.green('Berhasil Diklaim')}\nPesan: ${chalk.blue(data.message)}`;
}

// Fungsi untuk memeriksa saldo
async function cekSaldo(api, nomorAkun) {
    try {
        const response = await api.get('/api/rewards/balance');
        console.log(chalk.cyan(`\n=== INFORMASI SALDO AKUN ${nomorAkun} ===`));
        console.log(formatSaldo(response.data));
        return response.data;
    } catch (error) {
        console.error(chalk.red(`\nError saat memeriksa saldo akun ${nomorAkun}:`), error.message);
        if (error.response) {
            console.error(chalk.red('Data Respon:'), error.response.data);
        }
    }
}

// Fungsi untuk mengklaim hadiah harian
async function klaimHadiahHarian(api, nomorAkun) {
    try {
        const response = await api.post('/api/rewards/daily/claim');
        console.log(chalk.cyan(`\n=== STATUS KLAIM AKUN ${nomorAkun} ===`));
        console.log(formatResponKlaim(response.data));
        return response.data;
    } catch (error) {
        console.error(chalk.red(`\nError saat mengklaim hadiah akun ${nomorAkun}:`), error.message);
        if (error.response) {
            console.error(chalk.red('Data Respon:'), error.response.data);
        }
    }
}

// Fungsi untuk mendapatkan waktu klaim berikutnya
function dapatkanWaktuKlaimBerikutnya() {
    const sekarang = new Date();
    const klaimBerikutnya = new Date(sekarang.getTime() + 24 * 60 * 60 * 1000);
    return klaimBerikutnya.toLocaleString();
}

// Fungsi utama untuk menjalankan operasi satu akun
async function prosesAkun(token, proxyUrl, nomorAkun) {
    const api = buatAxiosInstance(token, proxyUrl);
    
    console.log(chalk.yellow(`\n=== MEMULAI PROSES KLAIM AKUN ${nomorAkun} ===`));
    if (proxyUrl) {
        try {
            const proxyUrlObj = new URL(proxyUrl);
            console.log(chalk.cyan(`Proxy: ${proxyUrlObj.hostname}:${proxyUrlObj.port}`));
        } catch (error) {
            console.error(chalk.red('Error parsing proxy URL:'), error.message);
        }
    }
    console.log(chalk.cyan('Waktu saat ini:'), new Date().toLocaleString());
    console.log(chalk.cyan('Klaim berikutnya:'), dapatkanWaktuKlaimBerikutnya());
    
    // Cek IP sebelum memulai proses
    await cekIP(api);
    
    // Dapatkan info user
    await getUserInfo(api, nomorAkun);
    
    await cekSaldo(api, nomorAkun);
    await klaimHadiahHarian(api, nomorAkun);
    await cekSaldo(api, nomorAkun);
    
    console.log(chalk.green(`\n=== PROSES SELESAI AKUN ${nomorAkun} ===\n`));
}

// Fungsi untuk menjalankan semua akun
async function jalankanSemuaAkun() {
    const tokens = bacaToken();
    const proxies = bacaProxy();
    
    if (tokens.length === 0) {
        console.error(chalk.red('Tidak ada token yang ditemukan di token.txt'));
        return;
    }

    console.log(chalk.green(`Memulai Bot Klaim Humanity Protocol untuk ${tokens.length} akun...`));
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const proxyUrl = dapatkanProxyAcak(proxies);
        await prosesAkun(token, proxyUrl, i + 1);
        
        // Tunggu 5 detik sebelum memproses akun berikutnya
        if (i < tokens.length - 1) {
            console.log(chalk.yellow('Menunggu 5 detik sebelum memproses akun berikutnya...'));
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Fungsi untuk menjalankan script dalam loop
async function jalankanLoop() {
    while (true) {
        await jalankanSemuaAkun();
        console.log(chalk.yellow('Menunggu 24 jam hingga klaim berikutnya...'));
        await new Promise(resolve => setTimeout(resolve, 24 * 60 * 60 * 1000));
    }
}

// Mulai loop
jalankanLoop().catch(console.error);