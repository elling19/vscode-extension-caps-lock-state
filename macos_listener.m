#import <Foundation/Foundation.h>
#import <Carbon/Carbon.h>
#include <stdio.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        int previousState = -1;
        while (1) {  // for while
            unsigned int modifiers = GetCurrentKeyModifiers();
            if (argc == 1)
                printf("%d\n", modifiers);
            else {
                int i, result = 1;
                for (i = 1; i < argc; ++i) {
                    if (0 == strcmp(argv[i], "shift"))
                        result = result && (modifiers & shiftKey);
                    else if (0 == strcmp(argv[i], "option"))
                        result = result && (modifiers & optionKey);
                    else if (0 == strcmp(argv[i], "cmd"))
                        result = result && (modifiers & cmdKey);
                    else if (0 == strcmp(argv[i], "control"))
                        result = result && (modifiers & controlKey);
                    else if (0 == strcmp(argv[i], "capslock"))
                        result = result && (modifiers & alphaLock);
                }
                if (result != previousState) {
                    previousState = result;
                    printf("%d\n", result);
                    fflush(stdout);
                }
            }
            // sleep 100ms
            [NSThread sleepForTimeInterval:0.1];
        }
    }
    return 0;
}
// https://apple.stackexchange.com/questions/210789/check-if-caps-lock-on-in-terminal
// compilation command on macos:
// gcc -framework Foundation  -framework Carbon macos_listener.m -o macos_listener