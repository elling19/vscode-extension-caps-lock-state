#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
#include <Windows.h>
#else
#include <unistd.h>
#include <dirent.h>
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

static int has_capslock_led()
{
#ifndef _WIN32
    const char *leds_dir = "/sys/class/leds";
    DIR *dir = opendir(leds_dir);
    if (!dir) return 0;
    struct dirent *ent;
    while ((ent = readdir(dir)) != NULL) {
        if (ent->d_name[0] == '.') continue;
        if (strstr(ent->d_name, "capslock") != NULL) {
            closedir(dir);
            return 1;
        }
    }
    closedir(dir);
    return 0;
#else
    return 0;
#endif
}

int get_caps_lock_state()
{
    int state = 0;

#ifdef _WIN32
    state = GetKeyState(VK_CAPITAL) & 1;
#else
    // Prefer the simpler sysfs method: /sys/class/leds/*::capslock/brightness
    const char *leds_dir = "/sys/class/leds";
    DIR *dir = opendir(leds_dir);
    if (dir) {
        struct dirent *ent;
        while ((ent = readdir(dir)) != NULL) {
            if (ent->d_name[0] == '.') continue;
            if (strstr(ent->d_name, "capslock") == NULL) continue;
            char pathbuf[512];
            snprintf(pathbuf, sizeof(pathbuf), "%s/%s/brightness", leds_dir, ent->d_name);
            FILE *f = fopen(pathbuf, "r");
            if (!f) continue;
            char buf[32] = {0};
            if (fgets(buf, sizeof(buf), f) != NULL) {
                state = atoi(buf) != 0;
                fclose(f);
                break;
            }
            fclose(f);
        }
        closedir(dir);
    } else {
        state = 0;
    }
#endif

    return state;
}

int main(int argc, char *argv[])
{
    if (argc != 2)
    {
        printf("Usage: %s <sleep_duration_ms>\n", argv[0]);
        return 1;
    }
    int sleep_duration_ms = atoi(argv[1]);
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
        Sleep(sleep_duration_ms);
#else
        usleep(sleep_duration_ms * 1000);
#endif
    }
    return 0;
}
// window compile command:
// gcc caps_lock_listener.c -o caps_lock_listener.exe -luser32

// linux compile command: (no X11 dependency)
// gcc caps_lock_listener.c -o caps_lock_listener