// 1. Script Begins
({
    //*************************************************************************
    // 2. Information
    //*************************************************************************
    Info:
    {   Title:"Slack Bot v1.0.6",
        Author:"Joan A. Llarch - Barcelona - September 2020",
        Version:"1.0.6",
        Description:"Slack Bot App" ,

        Setup:
        {   botToken:
            {   Widget:"LineEdit",
                MaxLength:100,
                Width:420,
                Name:"Bot Token"
            },
            botName:
            {   Widget:"LineEdit",
                MaxLength:100,
                Width:420,
                Name:"Bot Name"
            },
            workspaceChannel:
            {   Widget:"LineEdit",
                MaxLength:100,
                Width:120,
                Name:"Channel Name"
            },		                   
        },  
        Commands: 
        {   get_conversation_list: 
            {   Name: "Get Channels List",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "1",
            },
            get_conversation_history:
            {   Name: "Get Channel History",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "2",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                },
            },
            get_conversation_members:
            {   Name: "Get Channel Members",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "3",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                },
            },
            conversation_join:
            {   Name: "Channel Join",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "4",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                },
            },
            conversation_leave:
            {   Name: "Channel Leave",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "5",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                },
            },
            get_user_list:
            {   Name: "Get Users List",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "6",
            },
            chat_post_message:
            {   Name: "Send Message",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "7",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                    text: {
                        Name: "Text",
                        Type: "String",      
                    },
                },
            },
            chat_post_message_block:
            {   Name: "Send Bot Message",
                GroupName: "Event",
                GroupOrder: "1",
                GroupCmdOrder: "8",
                Params: {
                    channelType: {
                        Name: "Type",
                        Type: "Enum",
                        Items: [ "Index", "Name" ],          
                    },
                    channel: {
                        Name: "Channel",
                        Type: "String",
                        MaxLength: 64,        
                    },
                    text: {
                        Name: "Text",
                        Type: "String",      
                    },
                    block: {
                        Name: "Blocks",
                        Type: "String",      
                    },
                },
            },

        },    
    },
    //*************************************************************************
    //  3. Setup Variables
    //*************************************************************************
    Setup:
    {   botToken: "",
        botName: "",
        workspaceChannel: "",
    },
    //*************************************************************************
    //  4. Device Variables
    //*************************************************************************
    Device: 
    {   // status
        responseString:"", 
        lastStatusCode: "",
        lastError:"",
        lastOk: "",
        lastTs: "",
        // medialon lists with slack data
        channelsList:"",
        usersList:"",
        membersList:"",
        // message received
        lastMessageText: "",
        lastMessageUserId: "",
        // in the Device object for debuging
        botId:"",
        isJoined: 0,
        counterWait: 0,
    },
    //*************************************************************************
    //  4. Local Script Variables
    //*************************************************************************
    // a programer option
    itemsEncoding: false,       // false => encoding by manager
    // "constants"
    slackUrl: "https://slack.com:443/api/",
    endpointConversationList: "conversations.list",
    endpointConversationHist: "conversations.history",
    endpointConversationJoin: "conversations.join",
    endpointConversationLeave: "conversations.leave",
    endpointConversationMemb: "conversations.members",
    endpointUserList: "users.list",
    endpointChatPostMsg: "chat.postMessage",
    waitTime: 120,
    pollingTime: 3,
    errorNoJson: "Invalid json format",
    medialonVars: [ "ConnectedPanels", "ConnectedWebpanelsIP","CPUUsage","CurrentDate",
    "CurrentDay","CurrentProjectFile","CurrentProjectTitle","CurrentStatus",
    "CurrentTime","HostIPAddresses","Hostname","MemoryUsage"],
    keyWords: [ "conPanels","ipPanels","cpu","date",
    "day","file","title","status",
    "time","hostIps","hostName","memory"],
    medialonDevice: "Manager",      // or change to "Showmaster"
    // global variables
    channels: [],
    users: [],
    isJoinedMessageFlag: 0,
    useIdSaved: "",
    //*************************************************************************
    //  5. Script Public Functions
    //*************************************************************************
    //  GET WORKSPACE CONVERSATIONS LIST
    get_conversation_list: function(){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackA = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackA.on( 'response', this._response_conversation_list );
        // url
        var url = this.slackUrl + this.endpointConversationList;
        // header
        var requestHeaders = this.HttpClientSlackA.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackA.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "";
        // make call
        this.HttpClientSlackA.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CONVERSATION JOIN
    conversation_join: function( channelType, channel ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackB = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackB.on( 'response', this._response_conversation_join );
        // url
        var url = this.slackUrl + this.endpointConversationJoin;
        // header
        var requestHeaders = this.HttpClientSlackB.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackB.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make call
        this.HttpClientSlackB.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CONVERSATION LEAVE
    conversation_leave: function( channelType, channel ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackC = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackC.on( 'response', this._response_conversation_leave );
        // url
        var url = this.slackUrl + this.endpointConversationLeave;
        // header
        var requestHeaders = this.HttpClientSlackC.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackC.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make call
        this.HttpClientSlackC.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET CONVERSATION HISTORY
    get_conversation_history: function( channelType, channel ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackD = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackD.on( 'response', this._response_conversation_hist );
        // url
        var url = this.slackUrl + this.endpointConversationHist;
        // header
        var requestHeaders = this.HttpClientSlackD.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackD.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        if ( this.Device.lastTs != "" )
            items = items + '&' + "oldest=" +  this.Device.lastTs;
        // make call
        this.HttpClientSlackD.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET CONVERSATION MEMBERS
    get_conversation_members: function( channelType, channel ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackE = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackE.on( 'response', this._response_conversation_members );
        // url
        var url = this.slackUrl + this.endpointConversationMemb;
        // header
        var requestHeaders = this.HttpClientSlackE.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackE.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make call
        this.HttpClientSlackE.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET WORKSPACE USERS LIST
    get_user_list: function(){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackF = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackF.on( 'response', this._response_user_list );
        // url
        var url = this.slackUrl + this.endpointUserList;
        // header
        var requestHeaders = this.HttpClientSlackF.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackF.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "";
        // make call
        this.HttpClientSlackF.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CHAT POST MESSAGE TEXT
    chat_post_message: function( channelType, channel, text ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackG = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackG.on( 'response', this._response_chat_message );
        // url
        var url = this.slackUrl + this.endpointChatPostMsg;
        // header
        var requestHeaders = this.HttpClientSlackG.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackG.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        items = items + '&' + "text=" +  text;
        // make call
        this.HttpClientSlackG.post(url, requestHeaders, "", items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CHAT POST MESSAGE BLOCK JSON
    chat_post_message_block: function( channelType, channel, text, block ){
        this._clear_device_variables();
        // http client 
        this.HttpClientSlackH = QMedialon.CreateHTTPClient();      
        this.HttpClientSlackH.on( 'response', this._response_chat_message );
        // url
        var url = this.slackUrl + this.endpointChatPostMsg;
        // header
        var requestHeaders = this.HttpClientSlackH.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlackH.addHeader(requestHeaders, "Content-Type", "application/json" );
        // items
        var identifier = "";
        if ( channelType == '0'  )
            identifier = this.channels[channel].id;
        else if ( channelType == '1')
        {   var i = 0;
            var len = this.channels.length;
            while ( i < len )
            {   if ( this.channels[i].name == channel )
                {   identifier = this.channels[i].id;
                    break;
                }
                i++;
            }
        }
        // data
        var items = "";
        var data = {};
        data.channel = identifier;
        data.text = text;
        data.blocks = block;
        var data_json = JSON.stringify( data );
        // make call
        this.HttpClientSlackH.post(url, requestHeaders, data_json, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  5b. Script Private Functions
    //*************************************************************************
    _start: function(){
        // call loop for ever, every interval in miliseconds    
        var interval = 1000;
        // set interval to call
        QMedialon.SetInterval(this._loop_for_ever, interval );
    },
    //*************************************************************************
    //  LOOPS FOR EVER
    _loop_for_ever: function(){
        this.Device.counterWait++;
        // time to check if is still joined
        if ( this.Device.counterWait > this.waitTime  )
        {   this.Device.counterWait = 0;
            this._joined_check();
            return;
        }
        // poll every "this.pollingTime" seconds
        if ( this.Device.counterWait % this.pollingTime == 0)
        {   if ( this.Device.isJoined == 1)
            {   // send an announce message to get a timestamp
                var channelType = 1;    // 1: by name
                var channel = this.Setup.workspaceChannel;
                if ( this.isJoinedMessageFlag == 0 )
                {   this._joined_announce_message();
                    this.isJoinedMessageFlag = 1;
                }
                else
                    // new messages ?
                    this.get_conversation_history( channelType, channel );
            }
            else
                // clear last timestamp
                this.Device.lastTs = "";   
        }
    },
    //*************************************************************************
    //  CHECK IS JOINED IN THE CONVERSATION ( channel ) 
    _joined_check: function () {
        // get current data
        this.get_conversation_list();
        this.get_user_list();
        // wait a while for the answer to arrive
        QMedialon.SetTimeout(this._joined_check_2, 2000);
    },
    //
    _joined_check_2: function () {
        if ( this.channels.length > 0 && this.users.length > 0 )
        {   var i = 0;
            while ( i < this.channels.length )
            {   // check workspaceChannel exist 
                if ( this.channels[i].name ==  this.Setup.workspaceChannel )
                {   var channelType = 1;    // 1: by name
                    var channel = this.channels[i].name;
                    // check if is already joined
                    this.get_conversation_members ( channelType, channel );
                    // wait a while for the answer to arrive
                    QMedialon.SetTimeout(this._joined_check_3, 2000);
                    break;
                }
                i++;
            }
        }
    },
    //
    _joined_check_3: function () {
        if ( this.Device.isJoined == 0 )
        {   var channelType = 1;    // 1: by name
            var channel = this.Setup.workspaceChannel;
            this.conversation_join ( channelType, channel );
        }
    },
    //
    _joined_announce_message: function () {
        // update members list
        var channelType = 1;    // 1: by name
        var channel = this.Setup.workspaceChannel;
        var text = "Hi!! The " + this.Setup.botName + " is running";
        this.chat_post_message( channelType, channel, text );
    },
    //*************************************************************************
    //  CALLBACK GET CONVERSATION LIST
    _response_conversation_list: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    this.Device.channelsList = "";
                    this._clear_channels_array();
                    for ( var i=0; i<answer.channels.length; i++)
                    {   this.channels[i] = answer.channels[i];
                        this.Device.channelsList =  this.Device.channelsList + answer.channels[i].name + "\r\n";
                    }
                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK CONVERSATION JOIN
    _response_conversation_join: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   // check is a json string
                try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    if ( answer.ok == true )
                    {   this.Device.isJoined = 1;
                        this.isJoinedMessageFlag = 0;
                        // update members list
                        var channelType = 1;    // 1: by name
                        var channel = this.Setup.workspaceChannel;
                        this.get_conversation_members( channelType, channel );
                    }
                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK CONVERSATION LEAVE
    _response_conversation_leave: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    if ( answer.ok == true )
                    {   this.Device.isJoined = 0;
                        // update members list
                        var channelType = 1;    // 1: by name
                        var channel = this.Setup.workspaceChannel;
                        this.get_conversation_members( channelType, channel );
                    }
                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK GET CONVERSATION HISTORY
    _response_conversation_hist: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    if ( answer.ok == true )
                    {   if ( answer.messages.length > 0 )
                        {   var index = answer.messages.length-1;
                            // save ts, text and user
                            this.Device.lastTs = answer.messages[index].ts;
                            this.Device.lastMessageText = answer.messages[index].text;
                            this.Device.lastMessageUserId = answer.messages[index].user;
                            this._parse_messages_recv( this.Device.lastMessageText, this.Device.lastMessageUserId );
                        }
                    }
                }
                catch(e) {
                    this.Device.la.stError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK GET CONVERSATION MEMBERS
    _response_conversation_members: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    if ( answer.ok == true )
                    {   var i = 0;
                        // update list
                        this.Device.membersList = "";
                        for ( i=0; i<answer.members.length; i++)
                            this.Device.membersList = this.Device.membersList + answer.members[i] + "\r\n";
                        // check is joined
                        i = 0;
                        while ( i < answer.members.length )
                        {   if ( answer.members[i] == this.Device.botId )
                            {   this.Device.isJoined = 1;
                                break;
                            }
                            i++;
                        }
                    }
                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK GET USER LIST
    _response_user_list: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    this.Device.usersList = "";
                    this.botId = "";
                    this._clear_users_array();
                    for ( var i=0; i<answer.members.length; i++)
                    {   this.users[i] = answer.members[i];
                        this.Device.usersList =  this.Device.usersList + answer.members[i].name + "\r\n";
                        // get botId
                        if ( answer.members[i].name == this.Setup.botName )
                            this.Device.botId = answer.members[i].id;
                    }
                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //*************************************************************************
    //  CALLBACK CHAT MESSAGE
    _response_chat_message: function ( response, error ) {
        if ( error.errorCode == 0 )
        {   this.Device.lastStatusCode = response.statusCode;
            // show all json string
            this.Device.responseString = response.data.toString();
            // to object
            if ( response.data != "" )
            {   try {
                    var answer = JSON.parse(this.Device.responseString);
                    this.Device.lastOk = answer.ok;
                    if ( answer.ok == true )
                       this.Device.lastTs = answer.ts;

                }
                catch(e) {
                    this.Device.lastError = this.errorNoJson;
                }
            }
        }
        else
            this.Device.lastError = error.errorText;
    },
    //************************************************************************
    //  PARSE MESSAGES RECEIVED
    _parse_messages_recv: function ( text, userId ) {
        var textAnswer = "";
        var channelType = 1;    // 1: by name
        var channel = this.Setup.workspaceChannel;
        // check if we must greet the user for 1st time
        if ( this.useIdSaved != userId )
        {   var name = this._get_user_display_name( userId );
            textAnswer = "Hi " + name + ' !\nI can give you any value from medialon device variables. Please type one of these keywords:\n';
            var row = 0;
            var end = " - ";
            for ( var i=0; i<this.keyWords.length; i++)
            {   row++;
                if ( row == this.keyWords.length )
                {   end = "";
                }
                textAnswer = textAnswer + this.keyWords[i] + end;
            }
            this.chat_post_message( channelType, channel, textAnswer );
        }
        else
        {   // parse text
            var index = this._parse_messages_recv_2( text.toLowerCase() );
            var varName = this.medialonDevice + "." + this.medialonVars[index];
            var value = QMedialon.GetValueAsString( varName );
            if ( value != "")
                textAnswer = text + ": " + value;
            else
                textAnswer = text + ": unknown";
            // send
            this.chat_post_message( channelType, channel, textAnswer );
        }
        this.useIdSaved = userId;
    },
    // 
    _parse_messages_recv_2: function ( text ) {
        // find string key
        var i, index = 999;
        for ( i=0; i<this.keyWords.length; i++ )
        {   if ( text.indexOf( this.keyWords[i].toLowerCase() ) != -1 )
            {   index = i;
                break;
            }
        }
        return index;
    },
    //************************************************************************
    //  COMUN FUNCTIONS
    //************************************************************************
    //  GET USER DISPLAY NAME FROM USER ID
    _get_user_display_name: function ( userId ) {
        var i = 0;
        var name = "unknown";
        while ( i < this.users.length )
        {   if ( this.users[i].id == userId  )
            {   name = this.users[i].profile.display_name;
                if ( name == "")
                    name = this.users[i].name;
                break;
            }
            i++;
        }
        return name;
    },
    //************************************************************************
    //  GET CHANNEL ID FROM CHANNEL NAME
    _get_channel_id: function ( channelName ) {
        var i = 0;
        var id = "unknown";
        var len = this.channels.length;
        while ( i < len )
        {   if ( this.channels[i].name == channelName )
            {   id = this.channels[i].id;
                break;
            }
            i++;
        }
        return id;
    },
    //************************************************************************
    //  CLEAR DEVICE VARIABLES
    _clear_device_variables: function () {
        this.Device.lastStatusCode = "";
        this.Device.lastError = "";
        this.Device.lastOk = "";
        this.Device.responseString = "";
    },
    //************************************************************************
    //  CLEAR CHANNELS ARRAY
    _clear_channels_array: function () {
        var out;
        while ( this.channels.length > 0 )
        {   out = this.channels.pop();
        }
    },
    //************************************************************************
    //  CLEAR USERS ARRAY
    _clear_users_array: function () {
        var out;
        while ( this.users.length > 0 )
        {   out = this.users.pop();
        }
    },
    //************************************************************************
    //  BUILD HEADERS
    _build_header: function ( type ) {
        var requestHeaders = "";
        var contentType = "";
        if ( type == "urlencoded" )
            contentType = "application/x-www-form-urlencoded";
        else if ( type == "json" )
            contentType = "application/json";
        requestHeaders = this.HttpClientSlack.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = this.HttpClientSlack.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        return requestHeaders;
    },
    //************************************************************************
    // STARTUP FUNCTION
    //************************************************************************
    _mStart : function() {
        this._joined_check();
        // wait for 10 seconds to start the loop for ever
        this.Device.counterWait = 10;
        QMedialon.SetTimeout(this._start, 10000);
    },
    //*************************************************************************
// 6. Script Ends
}) 