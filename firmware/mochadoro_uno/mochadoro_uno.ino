const int segPins[] = {2, 3, 4, 5, 6, 7, 12}; // a, b, c, d, e, f, g
const int buzzerPin = 8;
const int greenPin = 9;
const int redPin = 10;
const int amberPin = 11;

// Common cathode: HIGH turns segment ON
const byte digitSegments[10][7] = {
  {HIGH, HIGH, HIGH, HIGH, HIGH, HIGH, LOW},    // 0
  {LOW,  HIGH, HIGH, LOW,  LOW,  LOW,  LOW},    // 1
  {HIGH, HIGH, LOW,  HIGH, HIGH, LOW,  HIGH},   // 2
  {HIGH, HIGH, HIGH, HIGH, LOW,  LOW,  HIGH},   // 3
  {LOW,  HIGH, HIGH, LOW,  LOW,  HIGH, HIGH},   // 4
  {HIGH, LOW,  HIGH, HIGH, LOW,  HIGH, HIGH},   // 5
  {HIGH, LOW,  HIGH, HIGH, HIGH, HIGH, HIGH},   // 6
  {HIGH, HIGH, HIGH, LOW,  LOW,  LOW,  LOW},    // 7
  {HIGH, HIGH, HIGH, HIGH, HIGH, HIGH, HIGH},   // 8
  {HIGH, HIGH, HIGH, HIGH, LOW,  HIGH, HIGH}    // 9
};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
  pinMode(buzzerPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(amberPin, OUTPUT);
  
  clearDisplay();
}

void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    parseCommand(cmd);
  }
}

void parseCommand(String cmd) {
  if (cmd.startsWith("LED:G:")) {
    digitalWrite(greenPin, cmd.substring(6).toInt() ? HIGH : LOW);
  } else if (cmd.startsWith("LED:A:")) {
    digitalWrite(amberPin, cmd.substring(6).toInt() ? HIGH : LOW);
  } else if (cmd.startsWith("LED:R:")) {
    digitalWrite(redPin, cmd.substring(6).toInt() ? HIGH : LOW);
  } else if (cmd.startsWith("DISP:")) {
    int digit = cmd.substring(5).toInt();
    if (digit >= 0 && digit <= 9) {
      showDigit(digit);
    }
  } else if (cmd == "BUZZ:ON") {
    digitalWrite(buzzerPin, HIGH);
  } else if (cmd == "BUZZ:OFF") {
    digitalWrite(buzzerPin, LOW);
  }
}

void showDigit(int d) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], digitSegments[d][i]);
  }
}

void clearDisplay() {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], LOW);
  }
}