import type { InstallLabels } from '@atlas/ui';

export const INSTALL_LABELS: InstallLabels = {
  install: '📲 Install',
  iosTitle: 'Add Atlas to your home screen',
  iosSteps: (
    <ol className="list-decimal space-y-2 pl-5">
      <li>In Safari, tap the Share button (the square with an arrow) at the bottom of the screen.</li>
      <li>Scroll down and tap “Add to Home Screen”, then “Add”.</li>
      <li>Open Atlas from its new icon. It's one app for the whole family: your child picks their hero, you pick “Parent”.</li>
    </ol>
  ),
  done: 'Got it',
};
