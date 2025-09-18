"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../icons";

interface Domain {
  id: number;
  name: string;
  verified: boolean;
  userId: number;
}

interface AddEmailPageProps {
  token: string | undefined;
}

export default function AddEmailPage({ token }: AddEmailPageProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch domains on mount
  useEffect(() => {
    if (!token) {
      setError("Please log in to view domains");
      return;
    }
    fetchDomains();
  }, [token]);

  const fetchDomains = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/domains", { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch domains");
      }
      const data = await res.json();
      setDomains(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddDomain = async () => {
    if (!token) {
      setError("Please log in to add a domain");
      return;
    }
    if (newDomain && !domains.find((d) => d.name === newDomain)) {
      try {
        const res = await fetch("http://localhost:8080/api/domains", {
          method: "POST",
          headers,
          body: JSON.stringify({ name: newDomain }),
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized: Please log in again");
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to create domain");
        }
        const domain = await res.json();
        setDomains([...domains, domain]);
        setNewDomain("");
        setError(null);
        closeModal();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!token) {
      setError("Please log in to edit a domain");
      return;
    }
    if (!editingDomain || !newDomain) {
      setError("No domain selected or empty domain name");
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/domains/${editingDomain.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name: newDomain }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update domain");
      }
      const updatedDomain = await res.json();
      setDomains(domains.map((d) => (d.id === editingDomain.id ? updatedDomain : d)));
      setNewDomain("");
      setEditingDomain(null);
      setError(null);
      closeModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (index: number) => {
    const domain = domains[index];
    setEditingDomain(domain);
    setNewDomain(domain.name);
    openModal();
    setOpenDropdown(null);
  };

  const handleDelete = async (index: number) => {
    if (!token) {
      setError("Please log in to delete a domain");
      return;
    }
    const domain = domains[index];
    try {
      const res = await fetch(`http://localhost:8080/api/domains/${domain.id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete domain");
      }
      setDomains(domains.filter((_, i) => i !== index));
      setError(null);
      setOpenDropdown(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleVerify = async (index: number) => {
    if (!token) {
      setError("Please log in to verify a domain");
      return;
    }
    const domain = domains[index];
    try {
      const res = await fetch(`http://localhost:8080/api/domains/${domain.id}/verify`, {
        method: "PATCH",
        headers,
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized: Please log in again");
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to toggle verification");
      }
      const updatedDomain = await res.json();
      setDomains(domains.map((d, i) => (i === index ? updatedDomain : d)));
      setError(null);
      setOpenDropdown(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleModalClose = () => {
    setNewDomain("");
    setEditingDomain(null);
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Email Sending Domains
            </h3>
            <Button onClick={openModal}>+ Add Domain</Button>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm relative"
              >
                <div>
                  <span className="text-gray-800 dark:text-gray-200 block">
                    {domain.name}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${domain.verified
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                  >
                    {domain.verified ? "Verified" : "Pending"}
                  </span>
                </div>

                {/* Dropdown */}
                <div className="relative">
                  <button
                    className="dropdown-toggle flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    onClick={() =>
                      setOpenDropdown(openDropdown === index ? null : index)
                    }
                  >
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>

                  <Dropdown
                    isOpen={openDropdown === index}
                    onClose={() => setOpenDropdown(null)}
                  >
                    <DropdownItem
                      onClick={() => handleEdit(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleDelete(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Delete
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleToggleVerify(index)}
                      className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {domain.verified ? "Unverify" : "Verify"}
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Domain Modal */}
      <Modal isOpen={isOpen} onClose={handleModalClose} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {editingDomain ? "Edit Domain" : "Add New Domain"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {editingDomain
              ? "Edit the email domain for sending campaigns."
              : "Enter the email domain you want to use for sending campaigns."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingDomain ? handleEditSubmit() : handleAddDomain();
            }}
          >
            <div className="mb-5">
              <Label>Domain Name</Label>
              <Input
                type="text"
                placeholder="Enter domain name"
                defaultValue={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={handleModalClose}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                {editingDomain ? "Save Changes" : "Add Domain"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}