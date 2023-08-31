// messenger.js
// don't forget to validate at jslint.com

/*jslint devel: true, browser: true */
/*global fetch Audio*/

// reads through AJAX call for the JSON
// produced by the PHP script and updates the page!

(function () {
    "use strict";

    // shortcut function to make code more readable
    function byID(e) {
        return document.getElementById(e);
    }

    // shortcut function to make code more readable
    function show(element) {
        element.classList.remove("hidden");
    }

    // shortcut function to make code more readable
    function hide(element) {
        element.classList.add("hidden");
    }

    function convertTimestamp(timestamp) {

        // Convert the passed timestamp to milliseconds
        let d = new Date(timestamp * 1000);
        let yyyy = d.getFullYear();

        // Months are zero based. Add leading 0.
        let mm = ("0" + (d.getMonth() + 1)).slice(-2);

        // Days are zero based. Add leading 0.
        let dd = ("0" + d.getDate()).slice(-2);
        let hh = d.getHours();
        let h = hh;

        // Minutes are zero based. Add leading 0.
        let min = ("0" + d.getMinutes()).slice(-2);
        let ampm = "AM";

        if (hh > 12) {
            h = hh - 12;
            ampm = "PM";
        } else if (hh === 12) {
            h = 12;
            ampm = "PM";
        } else if (hh === 0) {
            h = 12;
        }

        // e.g.: 2013-02-18, 8:35 AM
        let time = "";
        time += yyyy + "-" + mm + "-" + dd;
        time += ", " + h + ":" + min + " " + ampm;

        return time;
    }

    function Chat() {
        let _newest_message = 0;
        let _newest_time = 0;
        let _message_sender = "";
        let _message_recipient = "";
        let _message_text = "";
        let _timezone_offset = 0;
        let _messenger_time = 0;

        let my = {
            message_recipient: _message_recipient,
            message_sender: _message_sender,
            message_text: _message_text,
            messenger_time: _messenger_time,
            newest_message: _newest_message,
            newest_time: _newest_time,
            timezone_offset: _timezone_offset
        };

        my.init = function () {
            let d = new Date();
            _timezone_offset = d.getTimezoneOffset() * 60;
            _messenger_time = Math.round(d.getTime() / 1000);
        };

        my.loggedIn = function () {
            let audio = byID("connect-sound");
            audio.play();
            _message_sender = byID("sender").value;
            _message_recipient = byID("recipient").value;
            byID("message-output").innerHTML = "";
            _newest_message = 0;
            show(byID("send-message-form"));
            byID("message-text").focus();
        };

        my.getMessages = function () {
            let connection_url = "getMessages.php";

            function buildMessageDiv(id) {
                let element = document.createElement("div");
                let e_id = "message-id-" + id;
                element.classList.add("message");
                element.id = e_id;
                return element;
            }

            function buildDataDiv(is_sender, datatype, data) {
                let element = document.createElement("div");
                let main_class = "message-" + datatype;
                element.classList.add(main_class);
                let sub_class = "";
                if (is_sender) {
                    sub_class = "sender-" + main_class;
                } else {
                    sub_class = "recipient-" + main_class;
                }
                element.classList.add(sub_class);
                element.innerHTML = data;
                return element;
            }

            function displayAlert(sender, text) {
                let audio = byID("alert-sound");
                audio.play();
                byID("alert-header").innerHTML = "message from " + sender;
                byID("alert-text").innerHTML = text;
                show(byID("dim"));
                show(byID("alert-message"));
            }

            function closeAlert() {
                byID("alert-header").innerHTML = "";
                byID("alert-text").innerHTML = "";
                hide(byID("dim"));
                hide(byID("alert-message"));
            }

            function parseMessages(message_object) {
                let msg_output = byID("message-output");
                let message_array = Array.from(message_object);
                message_array.forEach(function (data) {

                    if (parseInt(data.id) > _newest_message) {
                        _newest_message = parseInt(data.id);
                        _newest_time = data.time;

                        // outer message div
                        let new_msg = buildMessageDiv(data.id);

                        // get user & is_sender
                        let user = data.username;
                        let is_send = (user === _message_sender);

                        // add user div
                        let new_user = buildDataDiv(is_send, "username", user);
                        new_msg.insertAdjacentElement("afterbegin", new_user);

                        // add text div
                        let text = data.text;
                        let new_text = buildDataDiv(is_send, "text", text);
                        new_msg.insertAdjacentElement("afterbegin", new_text);


                        // add time div
                        let time = convertTimestamp(data.time);
                        let new_time = buildDataDiv(is_send, "time", time);
                        new_msg.insertAdjacentElement("afterbegin", new_time);

                        //add complete div to DOM
                        msg_output.insertAdjacentElement("afterbegin", new_msg);

                        if (_newest_time > _messenger_time) {
                            if (user === _message_recipient) {
                                displayAlert(user, text);
                            }
                        }
                    }
                });
            }

            if (_message_sender && _message_recipient) {
                let connection_string = connection_url;
                connection_string += "?sender=" + _message_sender;
                connection_string += "&recipient=";
                connection_string += _message_recipient;
                connection_string += "&newest_message=";
                connection_string += _newest_message;
                let messages = "";
                let response = "";
                let request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        response = request.responseText;
                        messages = JSON.parse(response);
                        parseMessages(messages);
                    }
                };
                request.open("GET", connection_string, true);
                request.send();
            }
            byID("alert-close").addEventListener("click", closeAlert);
        };

        my.deleteMessages = function () {
            let connection_url = "deleteMessages.php";
            let delete_msg = {
                "message_recipient": _message_recipient,
                "message_sender": _message_sender,
                "message_text": ""
            };
            let json_string = JSON.stringify(delete_msg);
            let request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    console.log(request.responseText);
                }
            };
            request.open("POST", connection_url, true);
            request.setRequestHeader(
                "Content-type",
                "application/json"
            );
            request.send(json_string);
            byID("message-output").innerHTML = "";
        };

        my.sendMessage = function () {
            let connection_url = "sendMessage.php";
            _message_text = byID("message-text").value;
            byID("message-text").value = "";

            if (_message_text.length > 0) {
                _message_text = _message_text.replace("'", "&apos;");
                _message_text = _message_text.replace("\"", "&quot;");
                let message = {
                    "message_recipient": _message_recipient,
                    "message_sender": _message_sender,
                    "message_text": _message_text
                };
                let json_string = JSON.stringify(message);
                let request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4 && request.status === 200) {
                        console.log(request.responseText);
                    }
                };
                request.open("POST", connection_url, true);
                request.setRequestHeader(
                    "Content-type",
                    "application/json"
                );
                request.send(json_string);
            }
        };

        my.quickClick = function (event) {
            let click_val = event.target.value;
            byID("recipient").value = click_val;
        };

        my.switchUsers = function () {
            let old_sender = byID("sender").value;
            let old_recipient = byID("recipient").value;
            byID("recipient").value = old_sender;
            byID("sender").value = old_recipient;
        };

        my.keyHandler = function (evt) {
            let key = evt.which || evt.keyCode;
            let element = document.activeElement;
            if (key === RETURN_KEY) {
                switch (element.id) {
                case "sender":
                case "recipient":
                    byID("server-submit").click();
                    break;
                case "message-text":
                    byID("message-submit").click();
                    break;
                }
            } else if (key === ESCAPE_KEY) {
                my.switchUsers();
                let smf_ow = byID("send-message-form").offsetWidth;
                let smf_oh = byID("send-message-form").offsetHeight;
                if ((smf_ow > 0) && (smf_oh > 0)) {
                    my.loggedIn();
                }
            }
            return false;
        };

        byID("send-message-form").addEventListener("submit", function (e) {
            e.preventDefault();
        });
        byID("message-text").addEventListener("keyup", my.keyHandler);
        byID("sender").addEventListener("keyup", my.keyHandler);
        byID("recipient").addEventListener("keyup", my.keyHandler);
        byID("switch-button").addEventListener("click", my.switchUsers);
        byID("evan").addEventListener("click", my.quickClick);
        byID("wendy").addEventListener("click", my.quickClick);
        byID("annie").addEventListener("click", my.quickClick);
        byID("drew").addEventListener("click", my.quickClick);
        byID("adam").addEventListener("click", my.quickClick);
        byID("server-submit").addEventListener("click", my.loggedIn);
        byID("message-submit").addEventListener("click", my.sendMessage);
        byID("delete-messages").addEventListener("click", my.deleteMessages);
        return my;
    }

    let chat = new Chat();
    const RETURN_KEY = 13;
    const ESCAPE_KEY = 27;
    chat.init();
    setInterval(chat.getMessages, 2000);
}());