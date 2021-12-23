#include <iostream>
using namespace std;

int fun(int arr[], int n) {
    for(int i=0; i<n; i++){
        for(int j=i+1; j<n; j++){
            if(arr[i] > arr[j]){
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = arr[i];

                break;
            }
        }
    }

    for(int i = 0; i<n; i++){
        cout << arr[i] << endl;
    }

    return 0;
};

int main () {
    int arr[9] = {1, 2, 31, 3, 1, 32, 9, 5, 0};
    cout << swap(2, 4);
    return 0;
};