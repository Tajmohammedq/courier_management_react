import { authContent } from '../content/authContent';
import type { AuthRole } from '../types/auth';

type RoleSwitchProps = {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
};

export function RoleSwitch({ value, onChange }: RoleSwitchProps) {
  return (
    <div className="role-switch" aria-label="Choose login type">
      <button
        type="button"
        className={value === 'user' ? 'role-switch__button is-active' : 'role-switch__button'}
        onClick={() => onChange('user')}
      >
        {authContent.login.toggle.user}
      </button>
      <button
        type="button"
        className={
          value === 'employee' ? 'role-switch__button is-active' : 'role-switch__button'
        }
        onClick={() => onChange('employee')}
      >
        {authContent.login.toggle.employee}
      </button>
    </div>
  );
}
