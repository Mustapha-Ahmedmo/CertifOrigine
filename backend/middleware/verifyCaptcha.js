// middleware/verifyCaptcha.js
require('dotenv').config();

const verifyCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;
    if (!captchaToken) {
      return res.status(400).json({ message: 'Captcha manquant' });
    }

    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ message: 'Clé reCAPTCHA serveur manquante' });
    }
    const expectedHostname = process.env.RECAPTCHA_EXPECTED_HOSTNAME; // optionnel

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: captchaToken,
        // remoteip: req.ip, // optionnel
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const result = await verifyRes.json();

    if (!result.success) {
      return res.status(400).json({ message: 'Vérification reCAPTCHA échouée' });
    }
    if (expectedHostname && result.hostname && result.hostname !== expectedHostname) {
            return res.status(400).json({ message: 'Hostname reCAPTCHA invalide' });
          }

    // Optionnel : vérifier le score/hostname/action si tu utilises v3/invisible
    // if (result.score && result.score < 0.5) return res.status(400).json({ message: 'Score reCAPTCHA insuffisant.' });

    return next();
  } catch (err) {
    console.error('reCAPTCHA error:', err);
    return res.status(502).json({ message: err.name === 'AbortError' ? 'Vérification reCAPTCHA expirée' : 'Erreur de vérification reCAPTCHA' });
  }
};

module.exports = verifyCaptcha;