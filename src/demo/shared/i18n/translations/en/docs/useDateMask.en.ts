import { PATHS } from '@/shared/router';

export const useDateMask = {
  lead: `Wrapper around [|useMask|](${PATHS.useMask}) for date and time inputs. Pass a format string — mask construction, per-field clamping and February / leap-year validation are handled automatically.`,
  overview: [
    'The format string follows moment.js (|DD/MM/YYYY|) or date-fns (|dd/MM/yyyy|) conventions — both casings are accepted. Each token becomes a group of digit slots with the correct constraints: month 01–12, day 01–31 adjusted to the current month and leap year. Separators (|/|, |.|, |-|, |:|, space) are preserved as literal characters.',
    'The formatted value returned via |onChange| is directly compatible with date-fns and moment — pass it straight to |parse(value, format, refDate)| or |moment(value, format)| without any extra conversion.',
    `The hook accepts all |useMask| props except |mask|, |blocks| and |normalize| — those are managed internally. See the [useMask docs](${PATHS.useMask}) for the full reference.`,
  ],
  params: {
    format:
      'Format string. Supported tokens: |dd|/|DD| (day 01–31), |MM| (month 01–12), |yyyy|/|YYYY| (4-digit year), |yy|/|YY| (2-digit year), |HH| (hours 00–23), |hh| (hours 01–12), |mm| (minutes 00–59), |ss| (seconds 00–59). Any other character becomes a literal separator.',
    value: 'Controlled value — a string in the given format.',
    onChange: 'Called on every change with the formatted value and |ParsedValues|.',
    min: 'Earliest allowed value. Accepts a |Date| object or a formatted string matching the |format| prop. Constraints are hierarchical — the minute limit only activates when the hour already equals the bound. Incomplete strings (e.g. |"14:__"|) are accepted; only fully-typed tokens participate.',
    max: 'Latest allowed value. Same semantics as |min|.',
  },
  recipes: {
    heading: 'Recipes',
    intro: 'Common patterns using |min| and |max|.',
    dateMax: 'Date — not in the future',
    timeRange: 'Two time pickers — end must not precede start',
  },
};
