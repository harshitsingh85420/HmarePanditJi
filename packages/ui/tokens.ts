export const themes = {
    customer: { primary: '#f49d25', primaryDark: '#e8540a', primaryLight: '#fde9c3', textOnPrimary: '#fff' },
    pandit: { primary: '#f09942', primaryDark: '#dc6803', primaryLight: '#fdf0d9', textOnPrimary: '#fff' },
    admin: { primary: '#137fec', primaryDark: '#0d5db8', primaryLight: '#dbeafe', textOnPrimary: '#fff' }
};

export const spacing = { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' };

export const shadows = {
    card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    cardHover: '0 4px 12px rgba(0,0,0,0.12)',
    modal: '0 20px 60px rgba(0,0,0,0.3)'
};

export type Theme = 'customer' | 'pandit' | 'admin';
