#include <emscripten.h>

#include <stdio.h>

extern "C" float js_random();

int main(int argc, char** argv) {
    printf("%f\n", js_random());
    return 0;
}
