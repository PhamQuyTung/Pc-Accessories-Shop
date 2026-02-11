// utils/promotionTime.js
function stripTime(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);i
    return d;
}

function isActiveNow(promo, now = new Date()) {
    if (!promo) return false;

    if (promo.type === 'once') {
        return now >= new Date(promo.once.startAt) && now < new Date(promo.once.endAt);
    }

    if (promo.type === 'daily') {
        const today = stripTime(now);
        if (promo.daily.startDate && today < stripTime(promo.daily.startDate)) return false;
        if (promo.daily.endDate && today > stripTime(promo.daily.endDate)) return false;

        const [sh, sm] = promo.daily.startTime.split(':').map(Number);
        const [eh, em] = promo.daily.endTime.split(':').map(Number);

        const start = new Date(today);
        start.setHours(sh, sm, 0, 0);
        const end = new Date(today);
        end.setHours(eh, em, 0, 0);

        // Nếu end <= start => khung giờ qua đêm (ví dụ 22:00 - 02:00)
        if (end <= start) {
            const endNext = new Date(today);
            endNext.setDate(endNext.getDate() + 1);
            endNext.setHours(eh, em, 0, 0);
            return now >= start || now < endNext;
        }
        return now >= start && now < end;
    }

    return false;
}

module.exports = { isActiveNow, stripTime };
