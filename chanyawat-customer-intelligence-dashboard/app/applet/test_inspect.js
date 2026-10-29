const https = require('https');

const SHEET_ID = '1RWLjTACfLrLuscyW2M8I3klBNA8U8J1ObB3Z6GL3mVY';
const SHEET_NAME = 'การตอบแบบฟอร์ม 1';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

function parseCSV(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
}

function get(u) {
    return new Promise((resolve, reject) => {
        https.get(u, res => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(get(res.headers.location));
            }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

(async () => {
    try {
        const text = await get(url);
        const rows = parseCSV(text);
        console.log('Total rows:', rows.length);
        const h = rows[0] || [];
        console.log('Header length:', h.length);
        h.forEach((name, idx) => {
            if (name.includes('สถานะ') || name.includes('ไม่สนใจ') || name.includes('เหตุผล') || name.includes('สื่อ') || name.includes('ช่องทาง') || idx === 24 || idx === 26 || idx === 38 || idx === 39) {
                console.log(`[${idx}] ${name}`);
            }
        });
    } catch (e) {
        console.error(e);
    }
})();
