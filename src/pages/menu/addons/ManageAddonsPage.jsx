import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ManageAddonsHeader from './components/ManageAddonsHeader';
import ManageAddonsTable from './components/ManageAddonsTable';

import AddAddonModal from './modals/Add Add-on/AddAddonModal';
import EditAddonModal from './modals/Edit Add-on/EditAddonModal';
import ConfirmDeleteAddonModal from './modals/Confirm Delete Add-on/ConfirmDeleteAddonModal';

import '../menuManagement.css';
import { useMenuManagement } from '../../../hooks/useMenuManagement';
import { useInventoryManagement } from '../../../hooks/useInventoryManagement';

const ManageAddonsPage = () => {
  const [isAddAddonModalOpen, setIsAddAddonModalOpen] = useState(false);
  const [isEditAddonModalOpen, setIsEditAddonModalOpen] = useState(false);
  const [isDeleteAddonModalOpen, setIsDeleteAddonModalOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState(null);

  const navigate = useNavigate();
  const { addons, categories, isLoading, refetch: refetchAddons } = useMenuManagement();
  const { inventoryItems } = useInventoryManagement();

  const handleEditClick = (item) => {
    setSelectedAddon(item);
    setIsEditAddonModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedAddon(item);
    setIsDeleteAddonModalOpen(true);
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
        handleDeleteClick={handleDeleteClick}
      />

      <AddAddonModal
        isOpen={isAddAddonModalOpen}
        onClose={() => setIsAddAddonModalOpen(false)}
        refetchAddons={refetchAddons}
        categories={categories}
        inventoryItems={inventoryItems}
      />

      <EditAddonModal
        isOpen={isEditAddonModalOpen}
        onClose={() => setIsEditAddonModalOpen(false)}
        addon={selectedAddon}
        refetchAddons={refetchAddons}
        categories={categories}
        inventoryItems={inventoryItems}
      />

      <ConfirmDeleteAddonModal
        isOpen={isDeleteAddonModalOpen}
        onClose={() => setIsDeleteAddonModalOpen(false)}
        addon={selectedAddon}
        refetchAddons={refetchAddons}
      />
    </div>
  );
};

export default ManageAddonsPage;
