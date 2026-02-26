import moment from 'moment';
import 'moment/locale/id';

moment.locale('id');

export const dateFormatMonth = (date) => {
    if (!date) return '-';
    return moment(date).format('MMMM YYYY');
};

export const dateFormatLong = (date, isDMY) => {
    if (!date) return '-';

    if (isDMY) return moment(date, 'DD-MM-YYYY').format('DD MMMM YYYY');
    else return moment(date).format('DD MMMM YYYY');
};

export const dateFormatInput = (date) => {
    if (!date) return '-';
    return moment(date).format('DD-MM-YYYY');
};

export const dateFormatData = (date) => {
    if (!date) return '-';
    const m = moment(date);
    const hour = m.hour();
    const displayHour = hour === 0 ? 24 : hour; // map 0 -> 24
    const minute = m.format('mm');
    return `${m.format('DD MMMM YYYY')} ${displayHour}:${minute}`;
};

export const dateFormatTime24 = (date) => {
    if (!date) return '-';
    const m = moment(date);
    const hour = m.hour();
    const displayHour = hour === 0 ? 24 : hour; // map 0 -> 24
    const minute = m.format('mm');
    return `${displayHour}:${minute}`;
};

export const dateFormatTimeline = (date) => {
    if (!date) return '-';
    const targetDate = moment(date);
    const currentTime = moment();

    const duration = moment.duration(Math.abs(currentTime.diff(targetDate)));

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();

    return `${days} Hari ${hours} Jam ${minutes} Menit`;
};

export const dateFormatHistory = (date) => {
    if (!date) return '-';
    return moment(date).format('DD MMMM YYYY HH:mm:ss');
};

export const dateFormatPost = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD');
};

export const dateFormatYear = (date) => {
    if (!date) return '';
    return moment(date).format('YYYY');
};

export const formatTextYear = (text, date) => {
    const givenDate = new Date(date);

    if (isNaN(givenDate)) return text;

    return text?.replace(/\{\{thn-(\d+)\}\}/g, (_, yearsBack) => {
        const yearOffset = parseInt(yearsBack, 10);
        const year = givenDate.getFullYear() - yearOffset;
        return year.toString();
    });
};

/* 
 * Optional: Attach to global window object if you want them globally accessible without imports
 * window.$dateFormatMonth = dateFormatMonth;
 * window.$dateFormatLong = dateFormatLong;
 * ...
 */
