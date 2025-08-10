import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { ColorPicker } from './ColorPicker';

interface ConfigPanelProps {
  config: {
    sizeMode: 'fixed' | 'responsive';
    width: number;
    height: number;
    colors: {
      background: string;
      border: string;
      title: string;
      ownerMsg: string;
      msgBg: string;
      msgText: string;
      replyText: string;
      scrollbar: string;
      inputBg: string;
      inputText: string;
      dateText: string;
      innerBorder: string;
    };
    settings: {
      userImages: boolean;
      allowUserMessageStyles: boolean;
      customFontSize: boolean;
      fontSize: number;
      showTimestamp: boolean;
      showUrl: boolean;
      privateMessaging: boolean;
      roundCorners: boolean;
      cornerRadius: number;
    };
  };
  onConfigChange: (newConfig: any) => void;
}

export const ConfigPanel = ({ config, onConfigChange }: ConfigPanelProps) => {
  const updateConfig = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current = newConfig as any;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onConfigChange(newConfig);
  };

  const colorItems = [
    { key: 'background', label: 'Background', color: '#CC0000' },
    // { key: 'border', label: 'Outer border', color: '#CC0000' },
    { key: 'title', label: 'Titles and icons', color: '#FFFFFF' },
    // { key: 'ownerMsg', label: "Owner's Message", color: '#FFFFFF' },
    { key: 'msgBg', label: 'Messages bg', color: '#FFFFFF' },
    { key: 'msgText', label: 'Messages text', color: '#000000' },
    { key: 'replyText', label: 'Reply message', color: '#1E81B0' },
    { key: 'dateText', label: 'Date text', color: '#CC0000' },
    // { key: 'scrollbar', label: 'Scrollbar', color: '#BBBBBB' },
    { key: 'inputBg', label: 'Input bg', color: '#FFFFFF' },
    // { key: 'inputText', label: 'Input text', color: '#000000' },
    
    // { key: 'innerBorder', label: 'Inner borders', color: '#CC0000' }
  ];

  return (
    <div className="w-80 bg-card border-r p-6 space-y-6 overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold mb-4">Size</h3>
        <RadioGroup
          value={config.sizeMode}
          onValueChange={(value) => updateConfig('sizeMode', value)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">Fixed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="responsive" id="responsive" />
            <Label htmlFor="responsive">Responsive</Label>
          </div>
        </RadioGroup>
        
        {config.sizeMode === 'fixed' && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={config.width}
                onChange={(e) => updateConfig('width', parseInt(e.target.value) || 242)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">px by</span>
              <Input
                type="number"
                value={config.height}
                onChange={(e) => updateConfig('height', parseInt(e.target.value) || 378)}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">px</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Scales to fit its parent container
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color</h3>
        {/* <p className="text-sm text-primary mb-4">Basic color controls</p>  */}
        
        <div className="space-y-3">
          {colorItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <Label className="text-sm">{item.label}</Label>
              <ColorPicker
                color={config.colors[item.key as keyof typeof config.colors]}
                onChange={(color) => updateConfig(`colors.${item.key}`, color)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Box settings</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="userImages"
              checked={config.settings.userImages}
              onCheckedChange={(checked) => updateConfig('settings.userImages', checked)}
            />
            <Label htmlFor="userImages" className="text-sm">User images</Label>
          </div>
          
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="allowStyles"
              checked={config.settings.allowUserMessageStyles}
              onCheckedChange={(checked) => updateConfig('settings.allowUserMessageStyles', checked)}
            />
            <Label htmlFor="allowStyles" className="text-sm">Allow user message styles</Label>
          </div> */}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="customFont"
                checked={config.settings.customFontSize}
                onCheckedChange={(checked) => updateConfig('settings.customFontSize', checked)}
              />
              <Label htmlFor="customFont" className="text-sm">Custom font size</Label>
            </div>
            {config.settings.customFontSize && (
              <div className="ml-6">
                <Slider
                  value={[config.settings.fontSize]}
                  onValueChange={(value) => updateConfig('settings.fontSize', value[0])}
                  max={24}
                  min={10}
                  step={1}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {config.settings.fontSize}px
                </p>
              </div>
            )}
          </div>
          
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="showTimestamp"
              checked={config.settings.showTimestamp}
              onCheckedChange={(checked) => updateConfig('settings.showTimestamp', checked)}
            />
            <Label htmlFor="showTimestamp" className="text-sm">Show timestamp</Label>
          </div> */}
          
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="showUrl"
              checked={config.settings.showUrl}
              onCheckedChange={(checked) => updateConfig('settings.showUrl', checked)}
            />
            <Label htmlFor="showUrl" className="text-sm">Show URL</Label>
          </div> */}
          
          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="privateMessaging"
              checked={config.settings.privateMessaging}
              onCheckedChange={(checked) => updateConfig('settings.privateMessaging', checked)}
            />
            <Label htmlFor="privateMessaging" className="text-sm">Private messaging</Label>
          </div> */}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="roundCorners"
                checked={config.settings.roundCorners}
                onCheckedChange={(checked) => updateConfig('settings.roundCorners', checked)}
              />
              <Label htmlFor="roundCorners" className="text-sm">Round corners</Label>
            </div>
            {config.settings.roundCorners && (
              <div className="ml-6">
                <Slider
                  value={[config.settings.cornerRadius]}
                  onValueChange={(value) => updateConfig('settings.cornerRadius', value[0])}
                  max={20}
                  min={4}
                  step={1}
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {config.settings.cornerRadius}px
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};