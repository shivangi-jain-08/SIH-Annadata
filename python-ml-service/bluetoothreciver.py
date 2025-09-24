# bluetoothreciver.py
import asyncio
from bleak import BleakClient, BleakScanner

SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

def lore(on_data):
    """
    on_data: a callback function that will be called
             every time new data comes from ESP32.
    """

    def notification_handler(sender, data):
        text = data.decode("utf-8")
        try:
            arr = eval(text)
            print("Got:", arr)
            on_data(arr)   # 🔥 send to main script in real time
        except Exception as e:
            print("Could not parse data:", e)

    async def main():
        devices = await BleakScanner.discover()
        esp32 = next((d for d in devices if d.address == "08:D1:F9:15:C3:0A"), None)

        if esp32 is None:
            print("ESP32 not found")
            return

        async with BleakClient(esp32) as client:
            print("Connected to ESP32")
            await client.start_notify(CHARACTERISTIC_UUID, notification_handler)

            # run forever until stopped
            while True:
                await asyncio.sleep(1)

    asyncio.run(main())
