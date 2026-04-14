import { ChangeEvent, useEffect, useState } from 'react';
import api from '../services/api';

type Branch = {
  id: string;
  name: string;
  address: string;
};

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const loadBranches = async () => {
    try {
      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (_err) {
      setBranches([]);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = async () => {
    try {
      const response = await api.post('/branches', { name, address });
      setBranches((prev) => [response.data, ...prev]);
      setName('');
      setAddress('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (branch: any) => {
    setSelectedBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
  };

  const handleSave = async () => {
    if (!selectedBranch) return;
    try {
      const response = await api.put(`/branches/${selectedBranch.id}`, { name, address });
      setBranches((prev) => prev.map((branch) => (branch.id === selectedBranch.id ? response.data : branch)));
      setSelectedBranch(null);
      setName('');
      setAddress('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (branchId: string) => {
    try {
      await api.delete(`/branches/${branchId}`);
      setBranches((prev) => prev.filter((branch) => branch.id !== branchId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="page">
      <div className="card">
        <h1>Branches</h1>
        <p>Manage business branches and local inventory hubs.</p>
      </div>
      <div className="card">
        <div className="field">
          <label>Name</label>
          <input value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Address</label>
          <input value={address} onChange={(e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)} />
        </div>
        <div className="button-group">
          <button className="button" onClick={selectedBranch ? handleSave : handleCreate}>
            {selectedBranch ? 'Save Branch' : 'Create Branch'}
          </button>
          {selectedBranch && (
            <button className="button secondary" onClick={() => {
              setSelectedBranch(null);
              setName('');
              setAddress('');
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.address}</td>
                <td>
                  <button className="button small" onClick={() => handleEdit(branch)}>Edit</button>
                  <button className="button small secondary" onClick={() => handleDelete(branch.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
