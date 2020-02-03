function get_config() {
    cfg = {
        'user' : null,
        'genome_set' : null,
        'target_template' : 'template_v3'
    }
    if (!localStorage.getItem('config')) {
        localStorage.setItem('config', JSON.stringify(cfg))
    }
    
    return JSON.parse(localStorage.getItem('config'))
}
