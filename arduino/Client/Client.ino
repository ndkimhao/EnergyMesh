#include <Arduino.h>
#include <SPI.h>
#include "EmonLibPro.h"
#include "RF24.h"
#include "RF24Network.h"
#include "RF24Mesh.h"
#include <avr/eeprom.h>

EmonLibPro Emon;
boolean DEBUG = true;
byte nodeId;

RF24 radio(9, 10);
RF24Network network(radio);
RF24Mesh mesh(radio, network);

struct payload_ctm_t {
  float U;
  float I[2];
  float P[2];
  uint16_t sess[2];
  byte from;
};

struct payload_mtc_t {
  uint16_t ctrlCode;
  boolean isOn;
};

uint16_t curSess[2];

byte skip_count = 3;
payload_ctm_t payload_ts;

unsigned long lastUpdate = 0;
const unsigned long UPDATE_INTERVAL = 50;

boolean devState[2] = {false, false};

void setup() {
  nodeId = eeprom_read_byte((uint8_t*)500);
  if (DEBUG) {
    Serial.begin(115200);
    Serial.println(F("Energy Mesh Client - Kim Hao @ 2015"));
    Serial.print(F("Node ID: "));
    Serial.println(nodeId);
  }

  payload_ts.from = nodeId;
  curSess[0] = eeprom_read_word((uint16_t*)400);
  curSess[1] = eeprom_read_word((uint16_t*)402);

  Emon = EmonLibPro();
  Emon.begin();
  if (DEBUG) Serial.println("Began emon");

  mesh.setNodeID(nodeId);
  mesh.begin();
  radio.setPALevel(RF24_PA_MAX);
  if (DEBUG) {
    if (radio.isPVariant()) {
      Serial.println(F("RF24 setup ok"));
      Serial.println(F("Connecting to the mesh network..."));
    }
    Serial.println(F("========================================\n"));
  }

  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
  pinMode(5, INPUT_PULLUP);
  pinMode(6, INPUT_PULLUP);

  pinMode(A4, OUTPUT);
  pinMode(A5, OUTPUT);
  pinMode(7, INPUT_PULLUP);
  pinMode(8, INPUT_PULLUP);
}

void loop() {
  if (Emon.FlagCALC_READY) {
    Emon.calculateResult();

    payload_ts.U = Emon.ResultV[0].U;
    for (byte i = 0; i < CURRENTCOUNT; i++) {
      if (DEBUG) printResults(i);
      payload_ts.I[i] = Emon.ResultP[i].I;
      payload_ts.P[i] = Emon.ResultP[i].P;
      payload_ts.sess[i] = curSess[i];
    }

    mesh.update();
    if (skip_count) {
      skip_count--;
      if (DEBUG) Serial.println("Skipped");
    } else {
      if (!mesh.write(&payload_ts, 'D', sizeof(payload_ts))) {
        if (DEBUG)
          if (!mesh.checkConnection()) {
            Serial.println("Renewing Address");
            mesh.renewAddress();
          } else {
            Serial.println("Send fail, Test OK");
          }
      } else {
        if (DEBUG) Serial.println("Send OK\n");
      }
    }

  }

  if (digitalRead(5) == LOW) {
    digitalWrite(3, HIGH);
    curSess[0]++;
    eeprom_update_word((uint16_t*)400, curSess[0]);
    delay(750);
    digitalWrite(3, LOW);
  }
  if (digitalRead(6) == LOW) {
    digitalWrite(4, HIGH);
    curSess[1]++;
    eeprom_update_word((uint16_t*)402, curSess[1]);
    delay(750);
    digitalWrite(4, LOW);
  }

  for (byte i = 0; i < 2; i++) {
    if (digitalRead(7 + i) == LOW) {
      devState[i] = !devState[i];
      digitalWrite(A4 + i, devState[i]);

      payload_mtc_t payload_mtc;
      payload_mtc.ctrlCode = nodeId << 8 | (i+1);
      payload_mtc.isOn = devState[i];
      if (!mesh.write(&payload_mtc, 'E', sizeof(payload_mtc))) {
        delay(50);
        mesh.write(&payload_mtc, 'E', sizeof(payload_mtc));
      }

      delay(750);
    }
  }

  unsigned long now = millis();
  if (now - lastUpdate > UPDATE_INTERVAL) {
    mesh.update();
    lastUpdate = now;
  }
  if (network.available()) {
    RF24NetworkHeader header;
    network.peek(header);
    switch (header.type) {
      case 'C':
        {
          payload_mtc_t payload_mtc;
          network.read(header, &payload_mtc, sizeof(payload_mtc));
          int ctrlCode = payload_mtc.ctrlCode & 0xFF;
          if (DEBUG) {
            Serial.print(F("Receive control: "));
            Serial.print(ctrlCode, HEX);
            Serial.print(payload_mtc.isOn ? F(" - ON") : F(" - OFF"));
            Serial.print(F("\n\n"));
          }
          if (0 <= ctrlCode && ctrlCode <= 2)
            digitalWrite(A4 + ctrlCode - 1, payload_mtc.isOn);
            devState[ctrlCode - 1] = payload_mtc.isOn;
          break;
        }
      default:
        network.read(header, 0, 0);
        break;
    }
  }
}

void printResults(byte i)
{
  Serial.print(F("Result "));
  Serial.print(i);
  Serial.print(F(": "));
  Serial.print(Emon.ResultV[0].U);
  Serial.print(F("VAC\t"));
  Serial.print(Emon.ResultV[0].HZ);
  Serial.print(F("Hz\t"));
  Serial.print(Emon.ResultP[i].I);
  Serial.print(F("A\t"));
  Serial.print(Emon.ResultP[i].P);
  Serial.print(F("W\t"));
  Serial.print(Emon.ResultP[i].S);
  Serial.print(F("VA\t"));
  Serial.print(Emon.ResultP[i].F);
  Serial.print(F("Pfact\t"));
  Serial.print(curSess[i]);
  Serial.print(F("sess"));
  Serial.print(F("\n"));
}
