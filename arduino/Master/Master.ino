#include <RF24Network.h>
#include <RF24.h>
#include <RF24Mesh.h>
#include <Ethernet.h>
#include <SPI.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include <stdlib.h>

RF24 radio(49, 53);
RF24Network network(radio);
RF24Mesh mesh(radio, network);

const float MIN_P = 1.5;
const byte CURRENTCOUNT = 2;

boolean DEBUG = true;
RF24NetworkHeader header;

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

byte mac[] = {  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress server(192, 168, 1, 131);
IPAddress ip(192, 168, 1, 153);
IPAddress gateway( 192, 168, 1, 100 );
IPAddress subnet( 255, 255, 255, 0 );

void setup() {
  if (DEBUG) {
    Serial.begin(115200);
    Serial.println(F("\nEnergy Mesh Master - Kim Hao @ 2015"));
    Serial.println(F("Node ID: 0 (Master)"));
  }

  Ethernet.begin(mac, ip);
  if (DEBUG) Serial.println("Ethernet setup ok");

  mesh.setNodeID(0);
  mesh.begin();
  radio.setPALevel(RF24_PA_MAX);
  if (DEBUG) {
    if (radio.isPVariant()) {
      Serial.println(F("RF24 setup ok"));
      Serial.println(F("Receiving data from mesh network..."));
    }
    Serial.println(F("========================================\n"));
  }


  /*   delay(1000);
   Serial.println("connecting...");

   // if you get a connection, report back via serial:
   if (client.connect(server, 80)) {
     Serial.println("connected");
     // Make a HTTP request:
     client.println("GET /search?q=arduino HTTP/1.0");
     client.println();
   }
   else {
     // if you didn't get a connection to the server:
     Serial.println("connection failed");
   }*/
}


void loop() {

  /*if (client.available()) {
    char buf[4096];
    int n = client.readBytes(buf, 4096);
    Serial.write((const uint8_t*)buf, n);
  }*/

  mesh.update();
  mesh.DHCP();

  if (network.available()) {
    RF24NetworkHeader header;
    network.peek(header);

    uint32_t dat = 0;
    switch (header.type) {
      case 'D':
        {
          payload_ctm_t payload_ts;
          network.read(header, &payload_ts, sizeof(payload_ts));
          if (DEBUG) {
            Serial.print(F("Receive data from node "));
            Serial.println(payload_ts.from);

            Serial.print(F(" _ "));
            Serial.print(payload_ts.U); Serial.print(F(" V **** "));
            Serial.print(payload_ts.sess[0]); Serial.print(F(" sess _ "));
            Serial.print(payload_ts.I[0]); Serial.print(F(" A _ "));
            Serial.print(payload_ts.P[0]); Serial.print(F(" W **** "));
            Serial.print(payload_ts.sess[1]); Serial.print(F(" sess _ "));
            Serial.print(payload_ts.I[1]); Serial.print(F(" A _ "));
            Serial.print(payload_ts.P[1]); Serial.print(F(" W _ "));
            Serial.println();
          }

          StaticJsonBuffer<512> jsonBuffer;
          JsonObject& root = jsonBuffer.createObject();
          JsonArray& arrSensor = root.createNestedArray("sensor");
          for (int i = 0; i < 2; i++) {
            if (abs(payload_ts.P[i]) > MIN_P) {
              JsonObject& dat = jsonBuffer.createObject();
              String sessId = String((uint16_t)payload_ts.from << 24 | (uint16_t)(i + 1) << 16 | (uint16_t)payload_ts.sess[i], HEX);
              dat["id"] = sessId;
              dat["u"].set(payload_ts.U, 4);
              dat["i"].set(payload_ts.I[i], 4);
              dat["p"].set(payload_ts.P[i], 4);
              arrSensor.add(dat);
            }
          }
          postData(root);

          break;
        }

      case 'E':
        {
          payload_mtc_t payload_mtc;
          network.read(header, &payload_mtc, sizeof(payload_mtc));
          if (DEBUG) {
            Serial.print(F("Receive device state: "));
            Serial.print(payload_mtc.ctrlCode, HEX);
            Serial.print(payload_mtc.isOn ? F(" - ON") : F(" - OFF"));
            Serial.print(F("\n\n"));
          }

          StaticJsonBuffer<512> jsonBuffer;
          JsonObject& root = jsonBuffer.createObject();
          JsonArray& arrStatus = root.createNestedArray("devStatus");

          JsonObject& dat = jsonBuffer.createObject();
          dat["ctrlCode"] = String(payload_mtc.ctrlCode, HEX);
          dat["isOn"] = payload_mtc.isOn;
          arrStatus.add(dat);

          postData(root);
        }

      default:
        network.read(header, 0, 0);
    }
  }
}

const int WAIT_TIME = 500;
char buf[256];
EthernetClient client;
void postData(JsonObject& jsonObject)
{
  if (client.connect(server, 80)) {
    client.println("POST /api/realtime/push HTTP/1.1");
    client.println("Host: localhost");
    client.println("User-Agent: Arduino/1.0");
    client.println("Connection: close");
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonObject.measureLength());
    client.println();
    jsonObject.printTo(client);

    long start = millis();
    int count = 0;
    while (client.connected() &&
           (millis() - start < WAIT_TIME || client.available())) {
      while (count < 4 && client.available()) {
        char c = client.read();
        if (c == '\r' || c == '\n') count++;
        else count = 0;
      }
      if (client.available()) {
        int n = client.readBytes(buf, 256);
        buf[n] = '\0';

        StaticJsonBuffer<512> jsonBuffer;
        JsonArray& arr = jsonBuffer.parseArray(buf);
        if (arr.success())
        {
          for (byte arr_i = 0; arr_i < arr.size(); arr_i++) {
            JsonObject& obj = arr[arr_i];
            uint16_t code = strtol(obj["ctrlCode"], NULL, 16);
            payload_mtc_t payload_mtc;
            payload_mtc.ctrlCode = code;
            payload_mtc.isOn = obj["isOn"];

            byte searchNode = code >> 8;
            int address = -1;
            for (int i = 0; i < mesh.addrListTop; i++) {
              if (mesh.addrList[i].nodeID == searchNode) {
                address = mesh.addrList[i].address;
                break;
              }
            }
            if (address != -1) {
              RF24NetworkHeader header(address, 'C');
              if (network.write(header, &payload_mtc, sizeof(payload_mtc))) {
                if (DEBUG) {
                  Serial.print("Sent control data to client: ");
                  Serial.println(searchNode);
                }
              }
            }

          }
        }

        Serial.println();
        Serial.println();
      }
    }
    client.stop();
  } else {
    if (DEBUG) Serial.println("connection failed");
  }
}
