import re

with open('lib/audio.ts', 'r') as f:
    content = f.read()

pattern = r'''(        oscL\.connect\(gainL\); gainL\.connect\(pannerL\); pannerL\.connect\(preMaster\);
        oscR\.connect\(gainR\); gainR\.connect\(pannerR\); pannerR\.connect\(preMaster\);
        oscL\.start\(now\); oscR\.start\(now\);)
        // Microdynamics \(Algorithmic Micro-LFO for organic pitch & amplitude drift\)
        if \(config\.highResMicrodynamics\) \{
            const microLFO = this\.ctx!\.createOscillator\(\);
            microLFO\.frequency\.value = 0\.1 \+ Math\.random\(\) \* 0\.2; // Slow random drift
            const pitchDrift = this\.ctx!\.createGain\(\);
            pitchDrift\.gain\.value = 0\.15; // 0\.15 Hz drift
            microLFO\.connect\(pitchDrift\);
            pitchDrift\.connect\(oscL\.frequency\);
            if \(typeof oscR !== 'undefined'\) pitchDrift\.connect\(oscR\.frequency\);
            
            const ampDrift = this\.ctx!\.createGain\(\);
            ampDrift\.gain\.value = 0\.05 \* targetAmpL; // 5% amplitude drift
            microLFO\.connect\(ampDrift\);
            ampDrift\.connect\(pGainL\.gain\);
            if \(typeof pGainR !== 'undefined'\) \{
                const ampDriftR = this\.ctx!\.createGain\(\);
                ampDriftR\.gain\.value = 0\.05 \* targetAmpR;
                microLFO\.connect\(ampDriftR\);
                ampDriftR\.connect\(pGainR\.gain\);
                this\.synthNodes\.push\(ampDriftR\);
            \}
            microLFO\.start\(now\);
            this\.synthNodes\.push\(microLFO, pitchDrift, ampDrift\);
        \}'''

content = re.sub(pattern, r'\1', content)

with open('lib/audio.ts', 'w') as f:
    f.write(content)

