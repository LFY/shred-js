#include <emscripten.h>

#include <stdio.h>

extern "C" float random();

int sample_integer(int i) {
    return (int)(i * (random()));
}

int run_test() {
    int res = 0;
    for (int i = 0; i < 1000000; i++) {
        res += sample_integer(5);
    }
    return res;
}

int main(int argc, char** argv) {

    printf("%d\n", run_test());
    return 0;
}
