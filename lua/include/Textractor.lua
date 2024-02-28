--[[
ProcessSentence is called each time Textractor receives a sentence of text.

Param sentence: sentence received by Textractor (UTF-8).
Param sentenceInfo: table of miscellaneous info about the sentence.

If you return a string, the sentence will be turned into that string.
If you return nil, the sentence will be unmodified.

This extension uses several copies of the Lua interpreter for thread safety.
Modifications to global variables from ProcessSentence are not guaranteed to persist.

Properties in sentenceInfo:
"current select": 0 unless sentence is in the text thread currently selected by the user.
"process id": process ID that the sentence is coming from. 0 for console and clipboard.
"text number": number of the current text thread. Counts up one by one as text threads are created. 0 for console, 1 for clipboard.
--]]
function send_sentence(server_address, port, sentence)
  socket = require("socket")
  -- Connect to the server
  local tcp = socket.tcp()
  local success, err_msg = tcp:connect(server_address, port)
  if not success then
    error(string.format("Error connecting to server: %s", err_msg))
  end

  -- Send the sentence with a newline character
  local sent_bytes, err_msg = tcp:send(sentence .. "\n")
  if not sent_bytes then
    error(string.format("Error sending data: %s", err_msg))
  end

  -- Close the connection
  tcp:close()
end

function ProcessSentence(sentence, sentenceInfo)
  --Your code here...
  local server_address = "127.0.0.1" -- Replace with the actual server address
  local port = 8080 -- Replace with the server port

  send_sentence(server_address, port, sentence)
end