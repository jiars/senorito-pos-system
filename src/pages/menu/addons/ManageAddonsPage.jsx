import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ManageAddonsHeader from './components/ManageAddonsHeader';
import ManageAddonsTable from './components/ManageAddonsTable';

import AddAddonModal from './modals/Add Add-on/AddAddonModal';
import EditAddonModal from './modals/Edit Add-on/EditAddonModal';
import ArchiveAddonModal from './modals/Archive Add-on/ArchiveAddonModal';

import '../menuManagement.css';
import { useMenuManagement } from '../../../hooks/useMenuManagement';
import { useInventoryManagement } from '../../../hooks/useInventoryManagement';

const ManageAddonsPage = () => {
  const [isAddAddonModalOpen, setIsAddAddonModalOpen] = useState(false);
  const [isEditAddonModalOpen, setIsEditAddonModalOpen] = useState(false);
  const [isArchiveAddonModalOpen, setIsArchiveAddonModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);

  const navigate = useNavigate();
  const { addons, archivedAddons, categories, isLoading, refetch: refetchAddons } = useMenuManagement();
  const { inventoryItems } = useInventoryManagement();

  const handleEditClick = (item) => {
    setSelectedAddon(item);
    setIsEditAddonModalOpen(true);
  };

  const handleArchiveClick = (item) => {
    setSelectedAddon(item);
    setIsArchiveAddonModalOpen(true);
  };

  return (
    <div className="menu-page">
      <ManageAddonsHeader
        setIsAddAddonModalOpen={setIsAddAddonModalOpen}
        navigate={navigate}
      />

      <ManageAddonsTable
        addons={addons}
        categories={categories}
        isLoading={isLoading}
        handleEditClick={handleEditClick}
        handleArchiveClick={handleArchiveClick}
      />

      <AddAddonModal
        isOpen={isAddAddonModalOpen}
        onClose={() => setIsAddAddonModalOpen(false)}
        refetchAddons={refetchAddons}
        categories={categories}
        inventoryItems={inventoryItems}
        existingAddons={[...addons, ...archivedAddons]}
      />

      <EditAddonModal
        isOpen={isEditAddonModalOpen}
        onClose={() => setIsEditAddonModalOpen(false)}
        addon={selectedAddon}
        refetchAddons={refetchAddons}
        categories={categories}
        inventoryItems={inventoryItems}
        existingAddons={[...addons, ...archivedAddons]}
      />

      <ArchiveAddonModal
        isOpen={isArchiveAddonModalOpen}
        onClose={() => setIsArchiveAddonModalOpen(false)}
        addon={selectedAddon}
        refetchAddons={refetchAddons}
      />
    </div>
  );
};

export default ManageAddonsPage;
