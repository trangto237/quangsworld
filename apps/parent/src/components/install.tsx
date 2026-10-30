import type { InstallLabels } from '@atlas/ui';
import { tr } from '../i18n';

/** Called at render time, so the texts follow the parent's language. */
export const installLabels = (): InstallLabels => ({
  install: tr('📲 Install'),
  iosTitle: tr('Add Atlas to your home screen'),
  iosSteps: (
    <ol className="list-decimal space-y-2 pl-5">
      <li>{tr('In Safari, tap the Share button (the square with an arrow) at the bottom of the screen.')}</li>
      <li>{tr('Scroll down and tap “Add to Home Screen”, then “Add”.')}</li>
      <li>{tr('Open Atlas from its new icon. It\'s one app for the whole family: your child picks their hero, you pick “Parent”.')}</li>
    </ol>
  ),
  done: tr('Got it'),
});
