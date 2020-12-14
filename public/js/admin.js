const deleteProduct = (btn) => {
    const projectId = btn.parentNode.querySelector('input[name=productId').value
    const csrf = btn.parentNode.querySelector('input[name=_csrf').value

    const article = btn.closest('article')

    fetch('/admin/product/' + projectId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf
        }
    })
        .then(e => e.json())
        .then(e => {
            console.log('Request json result: ', e);
            article.parentNode.removeChild(article)
        }).catch(e => {
            console.log(e);
        })
};