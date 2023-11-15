#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <Windows.h>
#else
#include <unistd.h>
#include <X11/XKBlib.h>
#endif

void print_caps_lock_state(int state)
{
    // go to the beginning of the line and clear the current line
    printf("\r");
    // print the changed state to standard output
    printf("%d\n", state);
    // refresh the output buffer
    fflush(stdout);
}

int get_caps_lock_state()
{
    int state = 0;

#ifdef _WIN32
    state = GetKeyState(VK_CAPITAL) & 1;
#else
    Display *display = XOpenDisplay(NULL);
    if (display == NULL)
    {
        fprintf(stderr, "Error opening X display\n");
        exit(EXIT_FAILURE);
    }

    XkbStateRec xkbState;
    XkbGetState(display, XkbUseCoreKbd, &xkbState);

    state = (xkbState.locked_mods & XkbCapsLockMask) != 0;

    XCloseDisplay(display);
#endif

    return state;
}

int main()
{
    int current_state = get_caps_lock_state();
    while (1)
    {
        int new_state = get_caps_lock_state();
        if (new_state != current_state)
        {
            print_caps_lock_state(new_state);
            current_state = new_state;
        }
        // sleep 500ms
#ifdef _WIN32
        Sleep(500);
#else
        usleep(500000);
#endif
    }
    return 0;
}
// window compile command:
// gcc caps_lock_listener.c -o caps_lock_listener.exe -luser32

// linux compile command: (need X11)
// gcc caps_lock_listener.c -o caps_lock_listener -lX11