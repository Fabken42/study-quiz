import { toast } from 'react-toastify';
import { faGrinStars, faLaugh, faSmile, faMeh, faFrown, faSadTear, faDizzy } from '@fortawesome/free-solid-svg-icons';

export const handleError = (message, duracao = 2000) => {
    toast.error(message, {
        autoClose: duracao,
    });
};
export const handleSuccess = (message, duracao = 2000) => {
    toast.success(message, {
        autoClose: duracao,
    });
};

export const countStatus = (terms, userId) => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    terms.forEach(term => {
        const userStatus = term.statuses.find(status => status.user === userId);
        const statusValue = userStatus ? userStatus.status : 4; // Default status is 4 if no user status is found
        counts[statusValue]++;
    });
    return counts;
};

export const getEmojiStatusAmount = (terms, userId) => {
    const counts = countStatus(terms, userId);
    return [7, 6, 5, 4, 3, 2, 1].map(status => counts[status]);
};

export const getTermStatus = (statuses, userId) => {
    const target = statuses?.find(item => item.user === userId);
    return target ? target.status : 4;
}

export const statusIcons = {
    7: { icon: faGrinStars, color: '#0000FF' },
    6: { icon: faLaugh, color: '#248001' },
    5: { icon: faSmile, color: '#39d301' },
    4: { icon: faMeh, color: '#e6cc00' },
    3: { icon: faFrown, color: '#FF8C00' },
    2: { icon: faSadTear, color: '#f01e2c' },
    1: { icon: faDizzy, color: '#800000' },
};