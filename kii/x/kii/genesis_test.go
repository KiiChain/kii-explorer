package kii_test

import (
	"testing"

	"github.com/stretchr/testify/require"
	keepertest "kii/testutil/keeper"
	"kii/testutil/nullify"
	"kii/x/kii"
	"kii/x/kii/types"
)

func TestGenesis(t *testing.T) {
	genesisState := types.GenesisState{
		Params: types.DefaultParams(),

		// this line is used by starport scaffolding # genesis/test/state
	}

	k, ctx := keepertest.KiiKeeper(t)
	kii.InitGenesis(ctx, *k, genesisState)
	got := kii.ExportGenesis(ctx, *k)
	require.NotNil(t, got)

	nullify.Fill(&genesisState)
	nullify.Fill(got)

	// this line is used by starport scaffolding # genesis/test/assert
}
