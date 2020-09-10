// 1. Script Begins
({
    //*************************************************************************
    // 2. Information
    //*************************************************************************
    Info:
    {   Title:"Slack Bot v1.0.7",
        Author:"Joan A. Llarch - Barcelona - September 2020",
        Version:"1.0.7",
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
        // medialon style lists with slack data
        channelsList:"",
        usersList:"",
        membersList:"",
        // from the last message received
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
    announceFlag: 0,
    useIdSaved: "",
    //*************************************************************************
    //  5. Script Public Functions
    //*************************************************************************
    //  GET WORKSPACE CONVERSATIONS LIST
    get_conversation_list: function(){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointConversationList;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientConList );
        // items
        var items = "";
        // make a post
        var data = "";
        this.HttpClientConList.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CONVERSATION JOIN
    conversation_join: function( channelType, channel ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointConversationJoin;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientConJoin );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make a post
        var data = "";
        this.HttpClientConJoin.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CONVERSATION LEAVE
    conversation_leave: function( channelType, channel ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointConversationLeave;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientConLeave );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make a post
        var data = "";
        this.HttpClientConLeave.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET CONVERSATION HISTORY
    get_conversation_history: function( channelType, channel ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointConversationHist;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientConHis );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        if ( this.Device.lastTs != "" )
            items = items + '&' + "oldest=" +  this.Device.lastTs;
        // make a post
        var data = "";
        this.HttpClientConHis.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET CONVERSATION MEMBERS
    get_conversation_members: function( channelType, channel ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointConversationMemb;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientConMemb );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items +  this._get_channel_id(channel);
        }
        // make a post
        var data = "";
        this.HttpClientConMemb.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  GET WORKSPACE USERS LIST
    get_user_list: function(){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointUserList;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientGetUserList );
        // items
        var items = "";
        // make a post
        var data = "";
        this.HttpClientGetUserList.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CHAT POST MESSAGE TEXT
    chat_post_message: function( channelType, channel, text ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointChatPostMsg;
        // header
        var requestHeaders = this._build_header ( "urlencoded", this.HttpClientPostMessg );
        // items
        var items = "channel=";
        if ( channelType == '0'  )
            items = items + this.channels[channel].id;
        else if ( channelType == '1')
        {   items = items + this._get_channel_id(channel);
        }
        items = items + '&' + "text=" +  text;
        // make a post
        var data = "";
        this.HttpClientPostMessg.post(url, requestHeaders, data, items, this.itemsEncoding);
    },
    //*************************************************************************
    //  CHAT POST MESSAGE BLOCK JSON - function not fully tested
    chat_post_message_block: function( channelType, channel, text, block ){
        this._clear_device_variables();
        // url
        var url = this.slackUrl + this.endpointChatPostMsg;
        // header
        var requestHeaders = this._build_header ( "json", this.HttpClientPostMessgBlock );
        // items
        var items = "";
        // data
        var data = {};
        var identifier = "";
        if ( channelType == '0'  )
            identifier = this.channels[channel].id;
        else if ( channelType == '1')
        {   identifier = this._get_channel_id(channel);
        }
        data.channel = identifier;
        data.text = text;
        data.blocks = block;
        var data_json = JSON.stringify( data );
        // make a post
        this.HttpClientPostMessgBlock.post(url, requestHeaders, data_json, items, this.itemsEncoding);
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
    //  LOOP FOR EVER
    _loop_for_ever: function(){
        this.Device.counterWait++;
        // time to check if is alredy joined
        if ( this.Device.counterWait > this.waitTime  )
        {   this.Device.counterWait = 0;
            this._joined_check();
            return;
        }
        // poll every "this.pollingTime" seconds
        if ( this.Device.counterWait % this.pollingTime == 0)
        {   if ( this.Device.isJoined == 1)
            {   // send once the announce message
                if ( this.announceFlag == 0 )
                {   this._announce_message();
                    this.announceFlag = 1;
                }
                else
                {   // poll for new message
                    var channelType = 1;    // 1: by name
                    var channel = this.Setup.workspaceChannel;
                    this.get_conversation_history( channelType, channel );
                }
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
    //*************************************************************************
    //  ANNOUNCE MESSAGE  - needed at startup to get the current timestamp in the answer
    _announce_message: function () {
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
                    // fill channels array
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
                        this.announceFlag = 0;
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
                        // save ts, text and user and parse
                        {   var index = answer.messages.length-1;
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
                    // fill users array
                    for ( var i=0; i<answer.members.length; i++)
                    {   this.users[i] = answer.members[i];
                        this.Device.usersList =  this.Device.usersList + answer.members[i].name + "\r\n";
                        // save botId
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
        // check if we must greet a new user for 1st time
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
        // find if the string key is in the keywords array
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
                // if display name is empty use the user name then
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
    //  CLEAR SOME STATUS DEVICE VARIABLES
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
    _build_header: function ( type, clientObject ) {
        var requestHeaders = "";
        var contentType = "";
        if ( type == "urlencoded" )
            contentType = "application/x-www-form-urlencoded";
        else if ( type == "json" )
            contentType = "application/json";
        requestHeaders = clientObject.addHeader(requestHeaders, "Authorization", "Bearer " + this.Setup.botToken );
        requestHeaders = clientObject.addHeader(requestHeaders, "Content-Type", "application/x-www-form-urlencoded" );
        return requestHeaders;
    },
    //************************************************************************
    //  SETUP HTTP CLIENTS - ONE FOR EACH FUNCTION THAT MAKES A POST
    _setup_http_clients: function () {
        // the client objects
        this.HttpClientConList = QMedialon.CreateHTTPClient();
        this.HttpClientConJoin = QMedialon.CreateHTTPClient();
        this.HttpClientConLeave = QMedialon.CreateHTTPClient();
        this.HttpClientConHis = QMedialon.CreateHTTPClient();
        this.HttpClientConMemb = QMedialon.CreateHTTPClient();
        this.HttpClientGetUserList = QMedialon.CreateHTTPClient();
        this.HttpClientPostMessg = QMedialon.CreateHTTPClient();
        this.HttpClientPostMessgBlock = QMedialon.CreateHTTPClient();
        // the call backs
        this.HttpClientConList.on( 'response', this._response_conversation_list );
        this.HttpClientConJoin.on( 'response', this._response_conversation_join );
        this.HttpClientConLeave.on( 'response', this._response_conversation_leave );
        this.HttpClientConHis.on( 'response', this._response_conversation_hist );
        this.HttpClientConMemb.on( 'response', this._response_conversation_members );
        this.HttpClientGetUserList.on( 'response', this._response_user_list );
        this.HttpClientPostMessg.on( 'response', this._response_chat_message );
        this.HttpClientPostMessgBlock.on( 'response', this._response_chat_message );
    },
    //************************************************************************
    // STARTUP FUNCTION
    //************************************************************************
    _mStart : function() {
        // setup htpp clients objects
        this._setup_http_clients();
        // get slack data
        this._joined_check();
        // wait for 10 seconds to start
        this.Device.counterWait = 10;
        QMedialon.SetTimeout(this._start, 10000);
    },
    //*************************************************************************
// 6. Script Ends
}) 