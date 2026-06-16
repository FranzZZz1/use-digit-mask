import { dedent } from './primitives';

export function numericInput(placeholder?: string): string {
  const placeholderAttr = placeholder ? `\n  placeholder="${placeholder}"` : '';
  return `<input
  {...props}
  type="text"${placeholderAttr}
/>`;
}

export const GHOST_SCSS = dedent`
  .wrapper {
    position: relative;
  }

  .overlay {
    pointer-events: none;
    user-select: none;

    position: absolute;
    z-index: 2;
    inset: 0;

    overflow: hidden;
    display: flex;
    align-items: center;

    padding: 0 12px;

    font-size: inherit;
    white-space: pre;
  }

  .overlay__filled {
    color: transparent;
  }

  .overlay__empty {
    color: rgb(128 128 128 / 50%);
  }
`;

export const GHOST_PHONE_SCSS = dedent`
  .wrapper {
    position: relative;
  }

  .overlay {
    pointer-events: none;
    user-select: none;

    position: absolute;
    z-index: 2;
    inset: 0;

    overflow: hidden;
    display: flex;
    align-items: center;

    padding: 8px 12px;

    white-space: pre;

    font-family: monospace;
  }

  .overlay__filled {
    color: transparent;
  }

  .overlay__empty {
    color: rgba(128, 128, 128, 0.5);
  }
`;

function buildPlaceholderAttr(placeholder?: string, extraCondition?: string): string {
  if (!placeholder) return '';
  if (extraCondition) return `\n        placeholder={${extraCondition} ? undefined : "${placeholder}"}`;
  return `\n        placeholder="${placeholder}"`;
}

export function ghostCandidatesJsx(placeholder?: string, extraCondition?: string): string {
  const condition = extraCondition ? `${extraCondition} && ghostValue` : 'ghostValue';
  let placeholderAttr = '';
  if (placeholder && extraCondition) {
    placeholderAttr = `\n          placeholder={${extraCondition} ? undefined : "${placeholder}"}`;
  } else if (placeholder) {
    placeholderAttr = `\n          placeholder="${placeholder}"`;
  }

  return dedent`
    <section>
      <div className={styles.wrapper}>
        <input
          {...props}
          type="text"${placeholderAttr}
        />
        {${condition} && (
          <span aria-hidden="true" className={styles.overlay}>
            <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
            <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
          </span>
        )}
      </div>
      {candidates.length > 1 && (
        <fieldset>
          <legend>Select country</legend>
          {candidates.map((c) => (
            <button key={c.id} type="button" onClick={() => selectCandidate(c)}>
              {c.label} {c.prefix}
            </button>
          ))}
        </fieldset>
      )}
    </section>
  `;
}

export function ghostOverlayJsx(placeholder?: string, extraCondition?: string): string {
  const placeholderAttr = buildPlaceholderAttr(placeholder, extraCondition);
  const condition = extraCondition ? `${extraCondition} && ghostValue` : 'ghostValue';

  return dedent`
    <div className={styles.wrapper}>
      <input
        {...props}
        type="text"${placeholderAttr}
      />
      {${condition} && (
        <span aria-hidden="true" className={styles.overlay}>
          <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
          <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
        </span>
      )}
    </div>
  `;
}
