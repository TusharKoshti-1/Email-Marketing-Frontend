"use client";
import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../../icons";

interface Domain {
  name: string;
  verified: boolean;
}

export default function SenderPage() {
  const { isOpen, openModal, closeModal } = useModal();
  const [domains, setDomains] = useState<Domain[]>([
    { name: "example.com", verified: true },
    { name: "marketing.io", verified: false },
  ]);
  const [newDomain, setNewDomain] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const handleAddDomain = () => {
    if (newDomain && !domains.find((d) => d.name === newDomain)) {
      setDomains([...domains, { name: newDomain, verified: false }]);
      setNewDomain("");
      closeModal();
    }
  };

  const handleDelete = (index: number) => {
    setDomains(domains.filter((_, i) => i !== index));
    setOpenDropdown(null);
  };

  const handleEdit = (index: number) => {
    const domain = domains[index];
    setNewDomain(domain.name);
    setDomains(domains.filter((_, i) => i !== index));
    openModal();
    setOpenDropdown(null);
  };

  const handleToggleVerify = (index: number) => {
    setDomains((prev) =>
      prev.map((d, i) =>
        i === index ? { ...d, verified: !d.verified } : d
      )
    );
    setOpenDropdown(null);
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

      {/* Add Domain Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="no-scrollbar relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add New Domain
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Enter the email domain you want to use for sending campaigns.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddDomain();
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
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddDomain}>
                Add Domain
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
