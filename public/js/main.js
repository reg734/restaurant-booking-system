document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reservationForm');
    const messageDiv = document.getElementById('message');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservation_date').setAttribute('min', today);

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = '處理中...';
        
        try {
            const checkResponse = await fetch(`/api/reservations/check-availability?date=${data.reservation_date}&time=${data.reservation_time}`);
            const availability = await checkResponse.json();
            
            if (!availability.available) {
                showMessage('抱歉，該時段已額滿，請選擇其他時間', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = '送出訂位';
                return;
            }
            
            const response = await fetch('/api/reservations/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage('訂位成功！我們已收到您的預訂', 'success');
                form.reset();
            } else {
                showMessage(result.error || '訂位失敗，請稍後再試', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('系統錯誤，請稍後再試', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '送出訂位';
        }
    });
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        setTimeout(() => {
            messageDiv.className = 'message';
        }, 5000);
    }
});