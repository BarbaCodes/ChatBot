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
        msg.reply("Digite o número de protocolo seguindo o exemplo: protocolo - seu protocolo.")
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

        msg.reply('Para pegar sua ficha de atendimento, envie o comando: ficha - seu nome - seu cpf')
    }

    else if(msg.body.startsWith('ficha -')) {
        let nome = msg.body.split('-')[1];
        let cpf = msg.body.split('-')[2];
    }
});

client.on('message_create', (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    console.log(after); // message after it was deleted.
    if (before) {
        console.log(before); // message before it was deleted.
    }
});

client.on('message_revoke_me', async (msg) => {
    // Fired whenever a message is only deleted in your own view.
    console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if (ack == 3) {
        // The message was read
    }
});

client.on('group_join', (notification) => {
    // User has joined or been added to the group.
    console.log('join', notification);
    notification.reply('User joined.');
});

client.on('group_leave', (notification) => {
    // User has left or been kicked from the group.
    console.log('leave', notification);
    notification.reply('User left.');
});

client.on('group_update', (notification) => {
    // Group picture, subject or description has been updated.
    console.log('update', notification);
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});

// Change to false if you don't want to reject incoming calls
let rejectCalls = true;

client.on('call', async (call) => {
    console.log('Call received, rejecting. GOTO Line 261 to disable', call);
    if (rejectCalls) await call.reject();
    await client.sendMessage(call.from, `[${call.fromMe ? 'Outgoing' : 'Incoming'}] Phone call from ${call.from}, type ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'} call. ${rejectCalls ? 'This call was automatically rejected by the script.' : ''}`);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.on('contact_changed', async (message, oldId, newId, isContact) => {
    /** The time the event occurred. */
    const eventTime = (new Date(message.timestamp * 1000)).toLocaleString();

    console.log(
        `The contact ${oldId.slice(0, -5)}` +
        `${!isContact ? ' that participates in group ' +
            `${(await client.getChatById(message.to ?? message.from)).name} ` : ' '}` +
        `changed their phone number\nat ${eventTime}.\n` +
        `Their new phone number is ${newId.slice(0, -5)}.\n`);

    /**
     * Information about the @param {message}:
     * 
     * 1. If a notification was emitted due to a group participant changing their phone number:
     * @param {message.author} is a participant's id before the change.
     * @param {message.recipients[0]} is a participant's id after the change (a new one).
     * 
     * 1.1 If the contact who changed their number WAS in the current user's contact list at the time of the change:
     * @param {message.to} is a group chat id the event was emitted in.
     * @param {message.from} is a current user's id that got an notification message in the group.
     * Also the @param {message.fromMe} is TRUE.
     * 
     * 1.2 Otherwise:
     * @param {message.from} is a group chat id the event was emitted in.
     * @param {message.to} is @type {undefined}.
     * Also @param {message.fromMe} is FALSE.
     * 
     * 2. If a notification was emitted due to a contact changing their phone number:
     * @param {message.templateParams} is an array of two user's ids:
     * the old (before the change) and a new one, stored in alphabetical order.
     * @param {message.from} is a current user's id that has a chat with a user,
     * whos phone number was changed.
     * @param {message.to} is a user's id (after the change), the current user has a chat with.
     */
});

client.on('group_admin_changed', (notification) => {
    if (notification.type === 'promote') {
        /** 
          * Emitted when a current user is promoted to an admin.
          * {@link notification.author} is a user who performs the action of promoting/demoting the current user.
          */
        console.log(`You were promoted by ${notification.author}`);
    } else if (notification.type === 'demote')
        /** Emitted when a current user is demoted to a regular user. */
        console.log(`You were demoted by ${notification.author}`);
});
