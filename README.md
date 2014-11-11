Leap Motion Hue Controller
==========================

Control your hue light system with your hands using a LeapMotion controller.

This is a node application that connects the LeapMotion to the Philips Hue api.  Philips Hue lights are controlled over a REST interface by a small piece of hardware.  I use the LeapMotion to calculate x/y coordinates of your palm relative to the sensor, then convert that to the color and brightness scale for the LEDs.  The result is quite fun to play around with.

![alt tag](http://i.imgur.com/obSkYW9.gif)

To use:
```bash
git clone git@github.com:wellsjo/LeapMotion-Hue-Controller.git && cd LeapMotion-Hue-Controller
npm install
./run.sh
```
