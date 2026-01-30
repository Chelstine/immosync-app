export function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}
