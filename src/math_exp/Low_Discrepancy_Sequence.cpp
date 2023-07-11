#include <cstdlib> 
#include <cstdio> 
#include <cmath> 
#include <iostream> 
#include <fstream> 
#include <random>
#include <assert.h>
#define Float float

const int Primes[] = {
	2, 3, 5, 7, 11,
	13, 17, 19, 23,
	29, 31, 37, 41,
	43, 47, 53, 59,
	61, 67, 71, 73 };

const int Width = 512;
const int Height = 512;
const int NumSamples = 200;
const int Strand = 3;

const int Offset[9][2] = {
	{0, 0},
	{0, 1},
	{0, -1},
	{1, 0},
	{-1, 0},
	{1, 1},
	{-1, -1},
	{1, -1},
	{-1, 1},
};

static Float RadicalInverse(int a, int base) {
	const Float invBase = (Float)1 / (Float)base;
	int reversedDigits = 0;
	Float invBaseN = 1;
	while (a) {
		int next = a / base;
		int digit = a - next * base;
		reversedDigits = reversedDigits * base + digit;
		invBaseN *= invBase;
		a = next;
	}
	return reversedDigits * invBaseN;
}

int GetNthPrime(int dimension) {
	return Primes[dimension];
}

Float Halton(int dimension, int index) {
	return RadicalInverse(index, GetNthPrime(dimension));
}

Float Hammersley(int dimension, int index, int numSamples) {
	if (dimension == 0)
		return index / (Float)numSamples;
	else
		return RadicalInverse(index, GetNthPrime(dimension - 1));
}

void WritePPM(const char* filename, const unsigned char* data, int width, int height) {
	std::ofstream ofs;
	ofs.open(filename);

	assert(ofs.is_open());

	ofs << "P5\n" << width << " " << height << "\n255\n";
	ofs.write((char*)data, width * height);
	ofs.close();
}

void SaveSample(unsigned char* pixels, int width, int height, Float x, Float y) {
	int px = (int)(x * Width );
	int py = (int)(y * Height);
	for (int i = 0; i < 9; i++) {
		int col = std::max(std::min(px + Offset[i][0], Width - 1), 0);
		int row = std::max(std::min(py + Offset[i][1], Height - 1), 0);
		pixels[row * width + col] = 0;
	}
}

int main() {
	unsigned char pixels[Height][Width];
	// generate halton sequence.
	memset(pixels, 0xff, sizeof(pixels));
	for (int i = 0; i < NumSamples; i++)
	{
		Float x = Halton(0, i);
		std::cout << x;
		Float y = Halton(1, i);
		std::cout << " " << y << std::endl;
		SaveSample(&pixels[0][0], Width, Height, x, y);
	}
	WritePPM("halton2.ppm", &pixels[0][0], Width, Height);

	// generate hammersley sequence.
	memset(pixels, 0xff, sizeof(pixels));
	for (int i = 0; i < NumSamples; i++)
	{
		Float x = Hammersley(0, i, NumSamples);
		Float y = Hammersley(1, i, NumSamples);
		SaveSample(&pixels[0][0], Width, Height, x, y);
	}
	WritePPM("hammersley2.ppm", &pixels[0][0], Width, Height);
	return 0;
}