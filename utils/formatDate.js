export const formatDate = (dateString) =>{
    if (!dateString) {
        return "";
    }
    const date = new Date(dateString);
    const today = new Date();

    // Eğer bugün yapıldıysa saat, değilse tarih gösterimi
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    }
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
};