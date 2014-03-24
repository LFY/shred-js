#include <emscripten.h>

#include <stdio.h>
#include "math.h"


extern "C" float random();

int sample_integer(int i) {
    return (int)(i * (random()));
}


bool log_flip(float lp) {
    return random() < exp(lp);
}

int sample_site() {
   return sample_integer(2);
}

float eq(int x, int y) {
    if (x == y) {
        return 0.0;
    } else {
        return log(0.1);
    }
}

float score(int* sites, int n) {
    float res = 0.0;
    for (int i = 0; i < n - 1; i++) {
        res += eq(sites[i], sites[i + 1]);
    }
    return res;
}




int main(int argc, char** argv) {

    int num_sites = 1000;
    int* sites = new int[num_sites];
    int* prop_sites = new int[num_sites];

    for (int i = 0; i < num_sites; i++) {
        sites[i] = sample_site();
        prop_sites[i] = sites[i];
    }

    int niter = 1000000;
    int skip = niter / 10;
    int iter = 0;

    while (iter < niter) {
        int prop_site = sample_integer(num_sites);

        prop_sites[prop_site] = sample_site();

        float curr_score = score(sites, num_sites);
        float prop_score = score(prop_sites, num_sites);

        if (log_flip(prop_score - curr_score)) {
            sites[prop_site] = prop_sites[prop_site];
        } else {
            prop_sites[prop_site] = sites[prop_site];
        }

        iter += 1;

        if ((iter % skip) == 0) {
            for(int i = 0; i < 5; i++) {
                printf("%d ", sites[i]);
            }
            printf("\n");
        }
    }

    return 0;
}

