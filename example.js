const { Client, Location, List, Buttons, LocalAuth } = require('./index');

const client = new Client({
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: { 
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: false
    }
});

client.initialize();

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);

    solicitacao = {}

    function geraProtocolo () {
        return Math.floor(10000 + Math.random() * 90000);
        //Verificar se o código existe no banco de dados
    }

    if (msg.body === 'oi') {
        msg.reply(`📬 Informe o serviço desejado:

📝 Digite 1 para *criar um processo*: reporte algum problema, por exemplo, uma lâmpada do poste da sua rua está queimada;

📂 Digite 2 para *consultar a situação de um processo* existente com o número do protocolo;

📅 Digite 3 para checar os *serviços oferecidos* pelo município.`)
    }

    else if (msg.body == '1'){
        msg.reply(`
Antenção, para solicitar a abertura de um novo processo você deve enviar a seguinte mensagem, nesta ordem utilizando o caractere*  - *para separar as informações:

*Solicito - Seu nome - Seu CPF (apenas números) - Descreva o problema com todos os detalhes - nível de urgencia do seu problema*`)
    }

    
    else if (msg.body.startsWith('solicito -')) {
        solicitacao.nome = msg.body.split('-')[1]
        solicitacao.cpf = msg.body.split('-')[2]
        solicitacao.descricao = msg.body.split('-')[3]
        solicitacao.urgencia = msg.body.split('-')[4]
        solicitacao.protocolo = geraProtocolo()
        
        // Subindo dados para o servidor express
        fetch(`http://localhost:3000/requerimentos/${solicitacao.nome}-${solicitacao.cpf}-${solicitacao.descricao}-${solicitacao.urgencia}-${solicitacao.protocolo}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });

        msg.reply(`
✅Comprovante de solicitação (❗caso alguma informação esteja inválida, seu processo será cancelado):

*Nome:* ${solicitacao.nome};
*CPF:* ${solicitacao.cpf};
*Justificativa:* ${solicitacao.descricao};
*Nivel de urgencia:* ${solicitacao.urgencia};

*🖊️Número do protocolo:* ${solicitacao.protocolo} *(é recomendado que anote-o)*.`)
    }

    else if(msg.body == '2'){
        msg.reply("📜Digite o número de protocolo seguindo o exemplo: protocolo - seu protocolo.")
    }
    
    else if(msg.body.startsWith('protocolo -')) {
        let protocolo = msg.body.split('-')[1]
        
        // Puxando dados do servidor express
        fetch(`http://localhost:3000/requerimentos`)
        .then(response => response.json())
        .then(data => {
            // Percorrendo array de objetos
            data.forEach(element => {
                if(element.protocolo == protocolo) {
                    msg.reply(`*Informações do protocolo: ${element.protocolo}*\n\nNome: ${element.nome}\nCPF: ${element.cpf}\nDescrição do problema: ${element.descricao}\nNível da urgência: ${element.grauUrgencia}\nStatus: ${element.status}`)
                }
            })
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
    }

    else if(msg.body == '3') {
        // Puxando dados do servidor express
        fetch(`http://localhost:3000/servicos`)
        .then(response => response.json())
        .then(data => {
            let servicos = '';
            data.forEach(element => {
                servicos += `\n${element.area}`;
            })
            msg.reply(`🔨 Serviços oferecidos:\n ${servicos}\n\n Envie o serviço seguindo o exemplo: serviço - seu serviço`)
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });
    }

    else if(msg.body.startsWith('serviço -')) {
        let servico = msg.body.split('-')[1]
        console.log(servico);
        
        // Puxando dados do servidor express
        fetch(`http://localhost:3000/servicos`)
        .then(response => response.json())
        .then(data => {
            // Percorrendo array de objetos
            data.forEach(element => {
                if(element.area == servico.trim()) {
                    msg.reply(`${element.nomeDoutor}\n${element.ubsNome}\n${element.area}\n${element.horariosAtendimento}\n${element.ficha}`)
                }
            })
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
        });

        msg.reply('📖Para pegar sua ficha de atendimento, envie o comando: ficha - seu nome - seu cpf')
    }

    else if(msg.body.startsWith('ficha -')) {
        let nome = msg.body.split('-')[1];
        let cpf = msg.body.split('-')[2];

        // Enviando dados para o servidor express
    }
});
