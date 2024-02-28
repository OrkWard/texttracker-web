#include "Extension.h"
#define DEFAULT_PORT "8080"

BOOL WINAPI DllMain(HMODULE hModule, DWORD ul_reason_for_call,
                    LPVOID lpReserved) {
  switch (ul_reason_for_call) {
  case DLL_PROCESS_ATTACH:
    MessageBoxW(NULL, L"Extension Loaded", L"Example", MB_OK);
    break;
  case DLL_PROCESS_DETACH:
    MessageBoxW(NULL, L"Extension Removed", L"Example", MB_OK);
    break;
  }
  return TRUE;
}

// #define COPY_CLIPBOARD
// #define EXTRA_NEWLINES

bool sendToServer(std::wstring &sentence) {
		sentence += L"\r\nhello, world!";
  {
    // init wsadata
    WSADATA wsaData;
    int init_status = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (init_status != 0) {
		sentence += L"\r\nhi";
      return true;
    }
  }

  struct addrinfo *addr = NULL, hints;
  {
    // set socket attribute
    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;
  }

  // Resolve the server address and port
  int iResult = getaddrinfo("localhost", DEFAULT_PORT, &hints, &addr);
  if (iResult != 0) {
    WSACleanup();
    return true;
  }

  // Create a SOCKET for connecting to server
  SOCKET clientSocket =
      socket(addr->ai_family, addr->ai_socktype, addr->ai_protocol);
  if (clientSocket == INVALID_SOCKET) {
    freeaddrinfo(addr);
    WSACleanup();
    return true;
  }

  // Connect to server.
  iResult = connect(clientSocket, addr->ai_addr, (int)addr->ai_addrlen);
  if (iResult == SOCKET_ERROR || clientSocket == INVALID_SOCKET) {
    closesocket(clientSocket);
    WSACleanup();
    freeaddrinfo(addr);
    return true;
  }

  int strLen = WideCharToMultiByte(CP_UTF8, 0, sentence.c_str(), -1, nullptr, 0,
                                   nullptr, nullptr);
  std::vector<char> buffer(strLen, 0);
  WideCharToMultiByte(CP_UTF8, 0, sentence.c_str(), -1, buffer.data(), strLen,
                      nullptr, nullptr);

  // Send the byte array
  int sentBytes = send(clientSocket, buffer.data(), buffer.size(), 0);
  if (sentBytes == SOCKET_ERROR) {
    closesocket(clientSocket);
    WSACleanup();
    return true;
  }

  // shutdown the connection for sending since no more data will be sent
  // the client can still use the ConnectSocket for receiving data
  iResult = shutdown(clientSocket, SD_SEND);
  if (iResult == SOCKET_ERROR) {
    printf("shutdown failed: %d\n", WSAGetLastError());
    closesocket(clientSocket);
    WSACleanup();
    return true;
  }

  return true;
}

/*
        Param sentence: sentence received by Textractor (UTF-16). Can be
   modified, Textractor will receive this modification only if true is returned.
        Param sentenceInfo: contains miscellaneous info about the sentence (see
   README). Return value: whether the sentence was modified. Textractor will
   display the sentence after all extensions have had a chance to process and/or
   modify it. The sentence will be destroyed if it is empty or if you call
   Skip(). This function may be run concurrently with itself: please make sure
   it's thread safe. It will not be run concurrently with DllMain.
*/
bool ProcessSentence(std::wstring &sentence, SentenceInfo sentenceInfo) {
  return sendToServer(sentence);

#ifdef COPY_CLIPBOARD
  // This example extension automatically copies sentences from the hook
  // currently selected by the user into the clipboard.
  if (sentenceInfo["current select"]) {
    HGLOBAL hMem =
        GlobalAlloc(GMEM_MOVEABLE, (sentence.size() + 2) * sizeof(wchar_t));
    memcpy(GlobalLock(hMem), sentence.c_str(),
           (sentence.size() + 2) * sizeof(wchar_t));
    GlobalUnlock(hMem);
    OpenClipboard(0);
    EmptyClipboard();
    SetClipboardData(CF_UNICODETEXT, hMem);
    CloseClipboard();
  }
  return false;
#endif // COPY_CLIPBOARD

#ifdef EXTRA_NEWLINES
  // This example extension adds extra newlines to all sentences.
  sentence += L"\r\n";
  return true;
#endif // EXTRA_NEWLINES
}
