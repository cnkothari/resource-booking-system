import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, UserPayload } from '../../types';
import Modal from '../../components/Modal';
import ErrorMessage from '../../components/ErrorMessage';

const schema = yup.object({
  name: yup.string().trim().required('Name is required').min(2, 'Name is too short').max(120),
  email: yup.string().trim().required('Email is required').email('Enter a valid email').max(160),
  department: yup
    .string()
    .trim()
    .max(120, 'Department is too long')
    .nullable()
    .transform((value: string) => value || null),
});

type FormValues = yup.InferType<typeof schema>;

interface UserFormModalProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: UserPayload) => void;
}

const UserFormModal = ({ open, user, loading, error, onClose, onSubmit }: UserFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', department: null },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        department: user?.department ?? null,
      });
    }
  }, [open, user, reset]);

  const submit = handleSubmit((values) => {
    onSubmit({
      name: values.name,
      email: values.email,
      department: values.department ?? null,
    });
  });

  return (
    <Modal
      open={open}
      title={user ? 'Edit user' : 'Add user'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={() => submit()} disabled={loading}>
            {loading ? 'Saving…' : user ? 'Save changes' : 'Create user'}
          </button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit}>
        {error && <ErrorMessage message={error} />}
        <div>
          <label className="label" htmlFor="user-name">
            Name
          </label>
          <input id="user-name" className="input" {...register('name')} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="user-email">
            Email
          </label>
          <input id="user-email" type="email" className="input" {...register('email')} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="user-department">
            Department
          </label>
          <input id="user-department" className="input" {...register('department')} />
          {errors.department && <p className="field-error">{errors.department.message}</p>}
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
