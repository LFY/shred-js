(define (S) (if (flip) '() (pair 1 (S))))

(define sample (S))
