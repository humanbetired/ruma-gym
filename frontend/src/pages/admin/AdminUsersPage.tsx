import { useEffect, useState } from 'react';
import { getUsersByRole, updateUserRole } from '../../api/users';
import type { UserBasic } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/ui/Pagination';
import { Search } from 'lucide-react';
import axios from 'axios';

const roleOptions = ['MEMBER', 'PERSONAL_TRAINER', 'ADMIN', 'OWNER'] as const;

const roleBadgeStyle: Record<string, string> = {
  MEMBER: 'text-text-secondary',
  PERSONAL_TRAINER: 'text-primary',
  ADMIN: 'text-secondary',
  OWNER: 'text-error',
};

const PAGE_SIZE = 5;

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserBasic[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canManageHighLevelRoles = currentUser?.role === 'OWNER';

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);

  async function loadUsers() {
    setIsLoading(true);

    try {
      const result = await getUsersByRole(
        undefined,
        searchQuery,
        page,
        PAGE_SIZE,
      );

      setUsers(result.data);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.message
      ) {
        setError(err.response.data.message);
      } else {
        setError('Gagal memuat data user.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(
    userId: string,
    newRole: string,
  ) {
    setError('');
    setChangingId(userId);

    try {
      await updateUserRole(userId, newRole);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: newRole }
            : u,
        ),
      );
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.message
      ) {
        setError(err.response.data.message);
      } else {
        setError('Gagal mengubah role.');
      }
    } finally {
      setChangingId(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2 text-text-primary">
        Kelola User
      </h1>

      <p className="text-text-secondary text-sm mb-6">
        Atur role user, misalnya menjadikan member sebagai personal
        trainer.
      </p>

      <div className="relative mb-6">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
          <Search size={18} />
        </div>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama, email, nomor HP, atau ID KTA..."
          className="neu-pressed h-12 pl-12 pr-4 rounded-xl border-none w-full text-text-primary placeholder:text-neutral focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {!canManageHighLevelRoles && (
        <p className="text-sm text-warning neu-pressed rounded-xl p-3 mb-4">
          Kamu login sebagai ADMIN, hanya OWNER yang bisa mengubah
          role menjadi/dari ADMIN atau OWNER.
        </p>
      )}

      {error && (
        <p className="text-sm text-error mb-4">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-text-secondary">
          Memuat...
        </p>
      ) : users.length === 0 ? (
        <p className="text-text-secondary">
          {searchQuery
            ? `Tidak ada user yang cocok dengan "${searchQuery}".`
            : 'Belum ada user.'}
        </p>
      ) : (
        <>
          <div className="neu-flat rounded-xl p-2 flex flex-col gap-1">
            {users.map((user) => {
              const isHighLevel =
                user.role === 'ADMIN' ||
                user.role === 'OWNER';

              const isLocked =
                isHighLevel &&
                !canManageHighLevelRoles;

              return (
                <div
                  key={user.id}
                  className="p-3 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:brightness-105 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary truncate">
                      {user.fullName}
                    </p>

                    {user.ktaNumber && (
                      <p className="text-xs font-mono text-secondary mt-0.5">
                        KTA: {user.ktaNumber}
                      </p>
                    )}

                    <p className="text-sm text-text-secondary truncate">
                      {user.email}
                    </p>

                    {user.role === 'MEMBER' && (
                      <div className="mt-1">
                        {user.activeMembership ? (
                          <span className="text-xs font-medium text-success">
                            Aktif:{' '}
                            {user.activeMembership.planName}
                            <br />
                            (s.d.{' '}
                            {new Date(
                              user.activeMembership.endDate,
                            ).toLocaleDateString(
                              'id-ID',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                            )
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-neutral">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg neu-pressed ${
                        roleBadgeStyle[user.role]
                      }`}
                    >
                      {user.role}
                    </span>

                    <select
                      value={user.role}
                      disabled={
                        isLocked ||
                        changingId === user.id
                      }
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value,
                        )
                      }
                      className="neu-flat-sm h-9 px-2 text-sm rounded-lg border-none text-text-primary disabled:opacity-40 w-full sm:w-auto"
                    >
                      {roleOptions.map((role) => {
                        const wouldBeHighLevel =
                          role === 'ADMIN' ||
                          role === 'OWNER';

                        const optionDisabled =
                          wouldBeHighLevel &&
                          !canManageHighLevelRoles;

                        return (
                          <option
                            key={role}
                            value={role}
                            disabled={optionDisabled}
                          >
                            {role}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}